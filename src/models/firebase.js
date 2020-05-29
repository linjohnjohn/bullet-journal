import firebase from 'firebase';
import 'firebase/firestore'
import firebaseConfig from '../firebase.config';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();