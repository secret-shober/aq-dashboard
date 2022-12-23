import type { NextApiRequest, NextApiResponse } from 'next';
import { getClient } from '../../src/server/client';
import { WarZoneData, WarZonePayload } from '../../src/common/types/warZone';
import { getWarZoneData } from '../../src/common/utils/warZone';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<WarZonePayload | null>
) {
    const client = await getClient();
    const collection = client.db('aq-dashboard').collection('war-zone');

    const warZoneData = await collection.findOne<WarZoneData>();
    await client.close();
    if (warZoneData) {
        try {
            const response = await getWarZoneData(warZoneData.zoneId);
            res.status(200).json(response);
        }
        catch (e) {
            res.status(404);
        }
    }
    else {
        res.status(500);
    }
}
