import type { NextApiRequest, NextApiResponse } from 'next';
import { getClient } from '../../src/server/client';
import { ContestPotEntry } from '../../src/common/types/goldPrediction';

interface ContestPotQuery {
    contestPotEntries: ContestPotEntry[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ContestPotEntry[] | null>
) {
    const client = await getClient();
    const collection = client.db('aq-dashboard').collection('gold-prediction');

    const query = { projection: { contestPotEntries: 1 } };

    const queryResult = await collection.findOne<ContestPotQuery>({}, query);

    await client.close();
    if (queryResult) {
        try {
            res.status(200).json(queryResult.contestPotEntries);
        }
        catch (e) {
            res.status(404);
        }
    }
    else {
        res.status(500);
    }
}
