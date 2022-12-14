import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { getClient } from '../client';

export const gatherPastParticipantIds = async (): Promise<number[]> => {
    const fileNames = await readdir(path.join(__dirname, '..', '..', 'sources'));
    let ids: number[] = [];

    const requests = fileNames.map(fileName =>
        readFile(path.join(__dirname, '..', '..', 'sources', fileName), 'utf-8')
    );

    const responses = await Promise.all(requests);

    responses.forEach(response => {
        ids = [...ids, ...JSON.parse(response)];
    });

    return Array.from(new Set(ids));
};

const seedDB = async () => {
    const allPastIds = await gatherPastParticipantIds();
    const client = await getClient();

    const pastIdCollection = client.db('aq-dashboard').collection('past-contest-ids');
    try {
        console.log('Dropping collection...');
        const transaction = await pastIdCollection.drop();
        console.log('Drop successful', transaction);
    }
    finally {
        console.log('Adding Collection...');
        const transaction = await pastIdCollection.insertOne({
            ids: allPastIds
        });

        console.log('Add successful', transaction);
        await client.close();
    }
};

seedDB();