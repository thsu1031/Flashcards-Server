import * as Nedb from 'nedb';
import { SessionToken } from '../Server/Model';

export class SessionTokenDBAccess {
    private nedb: Nedb;

    constructor() {
        this.nedb = new Nedb('database/UserSessionToken.db');
        this.nedb.loadDatabase();
    }

    public async storeSessionToken(token: SessionToken): Promise<void> {
        return new Promise((resolve, reject) => {
            this.nedb.insert(token, (err) => {
                if(err) reject(err)
                else resolve()
            })
        });
    }

    public async getToken(tokenId: string): Promise<SessionToken | undefined> {
        return new Promise(((resolve, reject) => {
            this.nedb.find({tokenId: tokenId}, (err: Error, docs: any[]) => {
                if(err) {
                    reject(err);

                } else {
                    if(docs.length === 0) {
                        resolve(undefined);
                    } else {
                        resolve(docs[0]);
                    }
                }
            });
        }));
    }
}
