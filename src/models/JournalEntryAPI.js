import firebase from 'firebase';
import { convertDateToUTC } from './dateUtils';

const db = firebase.firestore();


export default class JournalEntryAPI {


    static async getOrCreateJournalEntry(date) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }
        const UTCDate = convertDateToUTC(date);
        let doc = await db.collection('user').doc(user.uid).collection('journalEntry').doc(UTCDate.toUTCString()).get();

        if (doc.exists) {
            const data =  doc.data();
            data.date = data.date.toDate();
            return data;
        }

        const journalEntry = {
            date: UTCDate,
            owner: user.uid,
            trackers: [
                {
                    name: 'Worked Out',
                    type: 'Binary',
                    value: null
                },
                {
                    name: 'Sleep Amount',
                    type: 'Number',
                    value: null
                }
            ],
            contentState: null
        }
        await db.collection('user').doc(user.uid).collection('journalEntry').doc(UTCDate.toUTCString()).set(journalEntry);
        return journalEntry;
    }

    static async getJournalEntryByDateRange(startDate, endDate) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }

        const UTCStartDate = convertDateToUTC(startDate);
        const UTCEndDate = convertDateToUTC(endDate);
        let querySnapshot = await db.collection('user').doc(user.uid).collection('journalEntry').where('date',  '>=', UTCStartDate).where('date', '<=', UTCEndDate).get();
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            data.date = data.date.toDate();
            return data;
        });
    }

    static async updateJournalEntry(date, updatedJournalEntry) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }

        const UTCDate = convertDateToUTC(date);
        await db.collection('user').doc(user.uid).collection('journalEntry').doc(UTCDate.toUTCString()).update(updatedJournalEntry);
        return true; //@todo catch errors

    }

    static async createJournalEntry(date) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }
        const UTCDate = convertDateToUTC(date)

        const doc = await db.collection('user').doc(user.uid).collection('journalEntry').doc(UTCDate).set({
            owner: user.uid,
            trackers: []
        });
        return doc;
    }

    static async getJournalEntry(date) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }

        const UTCDate = convertDateToUTC(date);
        const doc = await db.collection('user').doc(user.uid).collection('journalEntry').doc(UTCDate).get();
        if (!doc.exists) {
            throw new Error('entry does not exist');
        } else {
            return doc.data();
        }

        // @todo try catch
    }

    static async getAllJournalEntries(ownerId) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }
        const querySnapshot = await db.collection('user').doc(user.uid).collection('journalEntry').get();
        return querySnapshot.docs.map(doc => doc.data());
    }

}