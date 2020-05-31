import firebase from 'firebase';
import { convertDateToUTC } from './dateUtils';

const db = firebase.firestore();
/*
Tracker
    - name
    - type
    - min?
    - max?
    - values: timestamps => value
*/
export default class TrackerAPI {
    static async createTracker(...newTracker) {
        // @todo check trackers for dups; maybe switch to using keys
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('You are not logged in!');
        }
        try {
            const doc = await db.collection('user').doc(user.uid).get();
            const data = doc.data();
            const { trackers = [] } = data;

            const newTrackers = [...trackers, ...newTracker];

            await db.collection('user').doc(user.uid).update({
                trackers: newTrackers
            });
            return newTrackers;
        } catch (e) {
            throw new Error('There was an issue creating a new tracker. Please try again');
        }
    }

    static async createDefaultTrackers() {
        await this.createTracker(
            { name: 'Sleep Amount', type: 'Number', min: 0, max: 10, values: {} },
            { name: 'Worked Out', type: 'Binary', values: {} }
        );
    }

    static async getAllTrackers() {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('You are not logged in!');
        }
        let doc;
        try {
            doc = await db.collection('user').doc(user.uid).get();
        } catch (error) {
            throw new Error(`We're unable to load your trackers!`);
        }
        const { trackers = [] } = doc.data();
        return trackers;
    }


    static async deleteTracker(name) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('You are not logged in!');
        }

        try {
            const doc = await db.collection('user').doc(user.uid).get();
            const { trackers = [] } = doc.data();
            const index = trackers.findIndex(t => t.name === name);
            trackers.splice(index, 1);
            await db.collection('user').doc(user.uid).update({
                trackers
            });
            return trackers;
        } catch (error) {
            throw new Error('There was an issue deleting your tracker. Please try again');
        }
    }

    static async updateTrackerValue(date, dailyTrackers) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }
        const UTCDate = convertDateToUTC(date);
        const trackers = await this.getAllTrackers();

        dailyTrackers.forEach(({ name, value }) => {
            const trackerIndex = trackers.findIndex(t => t.name === name);
            const tracker = trackers[trackerIndex];
            const { type, min, max } = tracker;

            if (type === 'Number' && (value > max || value < min)) {
                throw new Error('Tracker value is too large or too small')
            }

            if (tracker.values === undefined || tracker.values === null) {
                tracker.values = {}
            }
            tracker.values[UTCDate.getTime()] = value;
        });

        try {
            await db.collection('user').doc(user.uid).update({
                trackers
            });
        } catch (error) {
            throw new Error('There was an issue updating your tracker. Please try again');
        }
    }

    static async getTrackerValues(date) {
        const trackers = await this.getAllTrackers();
        return this.getTrackerValuesFromTrackers(date, trackers);
    }

    static getTrackerValuesFromTrackers(date, trackers) {
        const UTCDate = convertDateToUTC(date);
        return trackers.map(t => {
            return {
                name: t.name,
                type: t.type,
                min: t.min,
                max: t.max,
                value: (t.values || {})[UTCDate.getTime()] || null
            }
        });
    }
}