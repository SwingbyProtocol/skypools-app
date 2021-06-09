import type { NextApiRequest, NextApiResponse } from 'next';

const array: any[] = [];

export default function (req: NextApiRequest, res: NextApiResponse) {
  if (req.query.see === 'true') {
    res.status(200).json(array);
    return;
  }

  array.push({
    query: req.query ?? null,
    method: req.method ?? null,
    headers: req.headers ?? null,
    body: req.body ?? null,
  });

  res.status(200).end();
}
