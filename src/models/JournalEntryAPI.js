import firebase from 'firebase';
const db = firebase.firestore();

export default class JournalEntryAPI {
    static convertDateToUTC(date) {
        const month = date.getMonth();
        const dateOfMonth = date.getDate();
        const year = date.getFullYear();
        return new Date(Date.UTC(year, month, dateOfMonth));
    }


    static async getOrCreateJournalEntry(date) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }
        const UTCDate = this.convertDateToUTC(date);
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
                    value: 'Yes'
                },
                {
                    name: 'Sleep',
                    type: 'Number',
                    value: 8
                }
            ],
            contentState: null
        }
        await db.collection('user').doc(user.uid).collection('journalEntry').doc(UTCDate.toUTCString()).set(journalEntry);
        return journalEntry;
    }

    static async updateJournalEntry(date, updatedJournalEntry) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }

        const UTCDate = this.convertDateToUTC(date);
        await db.collection('user').doc(user.uid).collection('journalEntry').doc(UTCDate.toUTCString()).update(updatedJournalEntry);
        return true; //@todo catch errors

    }

    static async createJournalEntry(date) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }
        const UTCDate = this.convertDateToUTC(date)

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

        const UTCDate = this.convertDateToUTC(date);
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