import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-connection-string';

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
        if (!this.client) {
            this.client = new MongoClient(MONGODB_URI);
            await this.client.connect();
            this._db = this.client.db('school-management');
        }
        return this._db;
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