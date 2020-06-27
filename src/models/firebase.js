import firebase from 'firebase';
import 'firebase/firestore'

import firebaseConfig from '../firebase.config';

firebase.initializeApp(firebaseConfig);
firebase.analytics();
