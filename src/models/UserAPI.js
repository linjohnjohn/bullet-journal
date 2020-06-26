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

    static async getColorTheme() {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }

        const dbUser = await db.collection('user').doc(user.uid).get(); 
        const doc = dbUser.data()
        return doc.colorTheme;
    }

    static async updateColorTheme(theme) {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('please login');
        }

        await db.collection('user').doc(user.uid).update({
            colorTheme: theme
        }); 
    }

}