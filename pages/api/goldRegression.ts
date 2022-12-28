import type { NextApiRequest, NextApiResponse } from 'next';
import { getClient } from '../../src/server/client';
import { RankedRegressionEntry } from '../../src/common/types/goldPrediction';

interface RankedRegressionQuery {
    rankedRegressionEntries: RankedRegressionEntry[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<RankedRegressionEntry[] | null>
) {
    const client = await getClient();
    const collection = client.db('aq-dashboard').collection('gold-prediction');

    const query = { projection: { rankedRegressionEntries: 1 } };

    const queryResult = await collection.findOne<RankedRegressionQuery>({}, query);

    await client.close();
    if (queryResult) {
        try {
            res.status(200).json(queryResult.rankedRegressionEntries);
        }
        catch (e) {
            res.status(404);
        }
    }
    else {
        res.status(500);
    }
}
