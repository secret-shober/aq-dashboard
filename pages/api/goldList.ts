import type { NextApiRequest, NextApiResponse } from 'next';
import { getClient } from '../../src/server/client';
import type { GoldListRecord } from "../../src/common/types/goldList";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GoldListRecord | null>
) {
  const client = await getClient();
  const collection = client.db('aq-dashboard').collection('gold-list');
  const result = await collection
    .findOne<GoldListRecord>({ id: 1 });

  await client.close();
  res.status(200).json(result);
}
