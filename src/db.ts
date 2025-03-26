import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
}

class MongoDB {
    private static instance: MongoDB;
    private client: MongoClient | null = null;
    private _db: Db | null = null;

    private constructor() {}

    public static getInstance(): MongoDB {
        if (!MongoDB.instance) {
            MongoDB.instance = new MongoDB();
        }
        return MongoDB.instance;
    }

    public async connect() {
        try {
            if (!this.client) {
                console.log('Connecting to MongoDB...');
                this.client = new MongoClient(MONGODB_URI as string);
                await this.client.connect();
                console.log('Connected to MongoDB successfully');
                this._db = this.client.db('school-management');
            }
            return this._db;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    public async disconnect() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this._db = null;
        }
    }

    public get db(): Db | null {
        return this._db;
    }
}

export const dbInstance = MongoDB.getInstance();