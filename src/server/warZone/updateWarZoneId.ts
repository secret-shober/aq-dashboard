import dotenv from 'dotenv';
import { WarZoneData } from '../../common/types/warZone';
import { getLatestWarZoneId } from '../../common/utils/warZone';
import { getClient } from '../client';

dotenv.config();

const updateWarZoneId = async () => {
    console.log('Getting latest warzone ID...');
    const client = await getClient();
    const collection = client.db('aq-dashboard').collection('war-zone');
    const warZoneData = await collection.findOne<WarZoneData>();
    const latestId = await getLatestWarZoneId(warZoneData.zoneId);

    console.log(`The latest ID is: ${latestId}. Commiting ID to database...`);

    await collection.drop();

    await collection.updateOne({}, { '$set': { zoneId: latestId } }, { upsert: true });
    await client.close();
    console.log('Updated the war zone ID! Waiting for the next interval...');
};

const run = async () => {
    await updateWarZoneId();
    setInterval(async () => {
        await updateWarZoneId();
    }, 1000 * 60 * Number(process.env.INTERVAL_MINUTES));

};

run();