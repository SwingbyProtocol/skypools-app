import Cors from 'cors';
import type { NextApiRequest, NextApiResponse } from 'next';

const defaultCors = Cors();

export const corsMiddleware = ({
  req,
  res,
  cors = defaultCors,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  cors?: typeof defaultCors;
}) => {
  return new Promise((resolve, reject) => {
    cors(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};
