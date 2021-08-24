import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';
import { DateTime, Duration } from 'luxon';
import { LockId } from '@prisma/client';

import { Network } from '../networks';
import { corsMiddleware } from '../server__cors';
import { logger as loggerBase } from '../logger';
import { prisma, server__processTaskSecret } from '../server__env';

const WARN_IF_SPENT_MORE_THAN = Duration.fromObject({ seconds: 30 });

export class InvalidParamError extends Error {}

export class InvalidMethodError extends Error {}

export class NotAuthenticatedError extends Error {}

export class AlreadyLockedError extends Error {}

export class LockMismatchError extends Error {}

export const getStringParam = <T extends string>({
  req,
  name,
  from,
  oneOf,
  defaultValue,
}: {
  req: NextApiRequest;
  name: string;
  from: 'query' | 'body';
  oneOf?: T[] | readonly T[];
  defaultValue?: T;
}): T => {
  try {
    const value = req[from]?.[name];
    if (typeof value !== 'string') {
      throw new InvalidParamError(`"${name}" must be a string`);
    }

    if (oneOf && !oneOf.includes(value as any)) {
      throw new InvalidParamError(`"${name}" must be one of: ${oneOf.join(', ')}`);
    }

    return value as T;
  } catch (e) {
    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }

    throw e;
  }
};

export const createEndpoint =
  <T extends any = any>({
    isSecret = false,
    logId,
    fn,
  }: {
    isSecret?: boolean;
    logId: string;
    fn: (params: {
      req: NextApiRequest;
      res: NextApiResponse<T>;
      network: Network;
      lock: (lockId: LockId) => Promise<void>;
      assertLockIsValid: () => Promise<void>;
      prisma: typeof prisma;
      logger: typeof loggerBase;
    }) => void | Promise<void>;
  }) =>
  async (req: NextApiRequest, res: NextApiResponse<T>) => {
    const startedAt = DateTime.utc();

    const ctx = {
      network: undefined as Network | undefined,
      logger: loggerBase.child({ logId }),
      lockId: null as LockId | null,
    };

    try {
      await corsMiddleware({ req, res });

      const secret = getStringParam({ req, from: 'query', name: 'secret', defaultValue: '' });
      if (isSecret && server__processTaskSecret && server__processTaskSecret !== secret) {
        throw new NotAuthenticatedError(
          'Must provide a secret key to be able to call this endpoint',
        );
      }

      const getNetwork = () => {
        if (!ctx.network) {
          const value = getStringParam({
            req,
            from: 'query',
            name: 'network',
            oneOf: Object.values(Network).map((it) => it.toLowerCase() as Lowercase<typeof it>),
          });

          ctx.network = Network[value.toUpperCase() as Uppercase<typeof value>];
          ctx.logger = ctx.logger.child({ network: ctx.network });
        }

        return ctx.network;
      };

      return await fn({
        req,
        res,
        prisma,
        get network() {
          return getNetwork();
        },
        get logger() {
          return ctx.logger;
        },
        lock: async (id: LockId) => {
          ctx.lockId = id;
          ctx.logger = ctx.logger.child({ lockId: ctx.lockId });
          const network = ctx.network ?? getNetwork();

          const lock = await prisma.locks.findUnique({ where: { id_network: { id, network } } });
          if (
            lock &&
            !DateTime.fromJSDate(lock.at, { zone: 'utc' }).equals(startedAt) &&
            // If the lock is too old, we want to overwrite it and create a new one.
            DateTime.utc()
              .diff(DateTime.fromJSDate(lock.at, { zone: 'utc' }))
              .as('milliseconds') < Duration.fromObject({ minutes: 30 }).as('milliseconds')
          ) {
            throw new AlreadyLockedError(`"${id}" is already locked`);
          }

          await prisma.locks.upsert({
            where: { id_network: { id, network } },
            create: { id, network, at: startedAt.toJSDate() },
            update: { at: startedAt.toJSDate() },
          });

          ctx.logger.info('Lock %j created', id);
        },
        assertLockIsValid: async () => {
          if (!ctx.lockId) return;
          const network = ctx.network ?? getNetwork();

          const lock = await prisma.locks.findUnique({
            where: { id_network: { id: ctx.lockId, network } },
          });
          if (!lock || !DateTime.fromJSDate(lock.at, { zone: 'utc' }).equals(startedAt)) {
            throw new LockMismatchError(`"${ctx.lockId}" does not belong to this process`);
          }
        },
      });
    } catch (e) {
      const message = e?.message || '';

      if (e instanceof InvalidParamError) {
        ctx.logger.trace(e);
        res.status(StatusCodes.BAD_REQUEST).json({ message } as any);
        return;
      }

      if (e instanceof InvalidParamError) {
        ctx.logger.trace(e);
        res.status(StatusCodes.METHOD_NOT_ALLOWED).json({ message } as any);
        return;
      }

      if (e instanceof NotAuthenticatedError) {
        ctx.logger.trace(e);
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: message || 'No authentication was provided' } as any);
        return;
      }

      if (e instanceof AlreadyLockedError) {
        ctx.logger.trace(e);
        res
          .status(StatusCodes.LOCKED)
          .json({ message: message || 'This script is already being run' } as any);
        return;
      }

      if (e instanceof LockMismatchError) {
        ctx.logger.fatal(e);
        res.status(StatusCodes.LOCKED).json({ message: message || 'Lock assertion failed' } as any);
        return;
      }

      ctx.logger.error(e);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Something went wrong' } as any);
    } finally {
      const spent = DateTime.utc().diff(startedAt);

      const level: keyof typeof ctx.logger =
        spent.as('milliseconds') > WARN_IF_SPENT_MORE_THAN.as('milliseconds') ? 'warn' : 'info';

      ctx.logger[level]('Endpoint done in %dms!', spent.as('milliseconds'));
    }
  };
