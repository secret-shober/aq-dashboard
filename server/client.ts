import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_ADDRESS}/?retryWrites=true&w=majority`;

export const getClient = async (): Promise<MongoClient> => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        return client;
    }
    catch (e) {
        throw new Error(`Failed to connect to MongoDB: ${e}`);
    }
};