import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';
import { DateTime, Duration } from 'luxon';
import { Network } from '@prisma/client';

import { corsMiddleware } from '../server__cors';
import { logger } from '../logger';
import { server__processTaskSecret, prisma } from '../server__env';

const WARN_IF_SPENT_MORE_THAN = Duration.fromObject({ seconds: 30 });

export class InvalidParamError extends Error {}

export class InvalidMethodError extends Error {}

export class NotAuthenticatedError extends Error {}

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
  oneOf?: T[];
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
    fn,
  }: {
    isSecret?: boolean;
    fn: (params: {
      req: NextApiRequest;
      res: NextApiResponse<T>;
      network: Network;
      prisma: typeof prisma;
    }) => void | Promise<void>;
  }) =>
  async (req: NextApiRequest, res: NextApiResponse<T>) => {
    const startedAt = DateTime.utc();

    try {
      await corsMiddleware({ req, res });

      const secret = getStringParam({ req, from: 'query', name: 'secret', defaultValue: '' });
      if (isSecret && server__processTaskSecret && server__processTaskSecret !== secret) {
        throw new NotAuthenticatedError(
          'Must provide a secret key to be able to call this endpoint',
        );
      }

      await fn({
        req,
        res,
        prisma,
        get network() {
          const value = getStringParam({
            req,
            from: 'query',
            name: 'network',
            oneOf: Object.values(Network).map((it) => it.toLowerCase() as Lowercase<typeof it>),
          });

          return Network[value.toUpperCase() as Uppercase<typeof value>];
        },
      });
    } catch (e) {
      const message = e?.message || '';

      if (e instanceof InvalidParamError) {
        logger.trace(e);
        res.status(StatusCodes.BAD_REQUEST).json({ message } as any);
        return;
      }

      if (e instanceof InvalidParamError) {
        logger.trace(e);
        res.status(StatusCodes.METHOD_NOT_ALLOWED).json({ message } as any);
        return;
      }

      if (e instanceof NotAuthenticatedError) {
        logger.trace(e);
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: message || 'No authentication was provided' } as any);
        return;
      }

      logger.error(e);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Something went wrong' } as any);
    } finally {
      const spent = DateTime.utc().diff(startedAt);
      const finalLogger = logger.child({ spent: spent.toObject() });

      finalLogger.info('Endpoint done!');
      if (spent.as('milliseconds') > WARN_IF_SPENT_MORE_THAN.as('milliseconds')) {
        finalLogger.warn('Took a bit long to finish');
      }
    }
  };
