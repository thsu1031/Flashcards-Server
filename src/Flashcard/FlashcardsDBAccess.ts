import * as Nedb from 'nedb';
import { Flashcard } from '../Shared/Model';

export class FlashcardsDBAccess {
    private nedb: Nedb;
    constructor() {
        this.nedb = new Nedb('database/FlashcardsDBAccess.db');
        this.nedb.loadDatabase();
    }

    public async postFlashcard(Flashcard: Flashcard): Promise<any> {
        return new Promise((resolve, reject) => {
            this.nedb.insert(Flashcard, (err, docs) => {
                if(err) {
                    reject(err)
                } else {
                    // console.log(docs)
                    resolve(docs)
                }
            })
        })
    }

    public async getFlashcardByUsername(username: string):  Promise<Flashcard | undefined> {
        return new Promise((resolve, reject) => {
            this.nedb.loadDatabase();
            this.nedb.find({username: username }, async(err:Error, docs: any)=> {
               
                if(err) {
                    reject(err)
                } else {
                    if(docs.length === 0) {
                        resolve(undefined)
                    } else {
                        resolve(docs)
                    }
                }
            })
        })
    }
}