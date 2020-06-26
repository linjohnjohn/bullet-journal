import firebase from 'firebase';
import 'firebase/firestore'

import firebaseConfig from '../firebase.config';
import firebaseConfigDev from '../firebase.dev.config.js';

// Initialize Firebase
if (process.env.FIREBASE_ENV === 'production') {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.initializeApp(firebaseConfigDev);
}
firebase.analytics();
