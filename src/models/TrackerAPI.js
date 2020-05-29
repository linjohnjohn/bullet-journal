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
        // @todod check trackers
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }
        const doc = await db.collection('user').doc(user.uid).get();
        const data = doc.data();
        const { trackers = [] } = data;
        const newTrackers = [...trackers, ...newTracker];
        await db.collection('user').doc(user.uid).update({
            trackers: newTrackers
        });
        return newTrackers;
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
            throw new Error('please login');
        }
        const doc = await db.collection('user').doc(user.uid).get();
        const { trackers = [] } = doc.data();
        return trackers;
    }


    static async deleteTracker(name) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }
        const doc = await db.collection('user').doc(user.uid).get();
        const { trackers = [] } = doc.data();
        const index = trackers.findIndex(t => t.name === name);
        trackers.splice(index, 1);
        await db.collection('user').doc(user.uid).update({
            trackers
        });
        return trackers;
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
            // @todo error handle
            if (tracker.values === undefined || tracker.values === null) {
                tracker.values = {}
            }
            tracker.values[UTCDate.getTime()] = value;
        });

        await db.collection('user').doc(user.uid).update({
            trackers
        });
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