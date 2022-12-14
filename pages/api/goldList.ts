import type { NextApiRequest, NextApiResponse } from 'next';
import { getClient } from '../../server/client';
import { GoldListRecord } from '../../server/goldList/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GoldListRecord | null>
) {
  const client = await getClient();
  const collection = client.db('aq-dashboard').collection('gold-list');
  const result = await collection
    .findOne<GoldListRecord>({ id: 1 });

  res.status(200).json(result);
}
