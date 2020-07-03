import firebase from 'firebase';
import { convertDateToUTC } from './dateUtils';

const db = firebase.firestore();


export default class JournalEntryAPI {
    static async getOrCreateJournalEntry(date) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('You are not logged in!');
        }
        const UTCDate = convertDateToUTC(date);

        try {
            let doc = await db.collection('user').doc(user.uid).collection('journalEntry').doc(UTCDate.toUTCString()).get();

            if (doc.exists) {
                const data = doc.data();
                data.date = data.date.toDate();
                return data;
            }
            const journalEntry = {
                date: UTCDate,
                owner: user.uid,
                contentState: null
            }
            await db.collection('user').doc(user.uid).collection('journalEntry').doc(UTCDate.toUTCString()).set(journalEntry);
            return journalEntry;
        } catch (error) {
            throw new Error(`We're unable to load your journal entry please try again!`)
        }
    }

    static async updateJournalEntry(date, updatedJournalEntry) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('You are not logged in!');
        }

        const UTCDate = convertDateToUTC(date);
        try {
            await db.collection('user').doc(user.uid).collection('journalEntry').doc(UTCDate.toUTCString()).update(updatedJournalEntry);
        } catch (e) {
            throw new Error('There is an issue updating this journal entry. Please try again later!');
        }
        return true;

    }
}