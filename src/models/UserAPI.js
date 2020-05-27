import firebase from 'firebase';
import TrackerAPI from './TrackerAPI';
const db = firebase.firestore();

export default class UserAPI {
    static async initializeUser() {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }

        const dbUser = await db.collection('user').doc(user.uid).get();
        if (!dbUser.exists) {
            await db.collection('user').doc(user.uid).set({});
            TrackerAPI.createDefaultTrackers();
        }
    }

}