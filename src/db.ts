import * as fs from 'fs';
import * as path from 'path';
import { Db } from './types';

export class db {
    public db!: Db;

    constructor() {
        this.read();
    }

    read() {
        this.db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8'));
    }

    write() {
        fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify(this.db, null, 2));
    }
}

export const dbInstance = new db();