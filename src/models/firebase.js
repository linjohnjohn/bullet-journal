import firebase from 'firebase';
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyDFqv1q29745GwZN5em6pbtlbtNwOi3XVA",
    authDomain: "bullet-journal-f849c.firebaseapp.com",
    databaseURL: "https://bullet-journal-f849c.firebaseio.com",
    projectId: "bullet-journal-f849c",
    storageBucket: "bullet-journal-f849c.appspot.com",
    messagingSenderId: "647579665010",
    appId: "1:647579665010:web:6ddd1a73eaa509019c78eb",
    measurementId: "G-067ERKT4NW"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();