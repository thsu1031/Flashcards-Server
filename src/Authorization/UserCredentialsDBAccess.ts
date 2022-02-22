import { UserCredentials } from "../Shared/Model";
import * as Nedb from 'nedb';
import bcrypt = require("bcrypt");

export class UserCredentialsDBAccess {
    private nedb: Nedb;
    
    constructor() {
        this.nedb = new Nedb('database/UserCredentials.db');
        this.nedb.loadDatabase();
    }

    public async putUserCredential(userCredentials: UserCredentials): Promise<any> {
        return new Promise((resolve, reject) => {
            this.nedb.insert(userCredentials, (err, docs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(docs)
                }
            })
        })
    }

    public async getUserCredential(username: string, password: string):  Promise<UserCredentials | undefined> {
        return new Promise((resolve, reject) => {
            this.nedb.loadDatabase();
            this.nedb.find({username: username }, async(err:Error, docs: UserCredentials[])=> {
                if(err) {
                    reject(err)
                } else {
                    if(docs.length === 0) {
                        resolve(undefined)
                    } else {
                        const validPassword = await bcrypt.compare(password, docs[0].password)
                        if (validPassword) {
                            resolve(docs[0])
                        }
                    }
                }
            })
        })
    }
}