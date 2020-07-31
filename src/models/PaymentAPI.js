import firebase from 'firebase';
import { loadStripe } from '@stripe/stripe-js';
const db = firebase.firestore();
const functions = firebase.functions();

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51H9HKWDQRGzRjAZt09f7AwRkSY75cSPJEucNPilVVY7WoP0T922MklVl66WlwIaf0Lxc9LTWEcLiHtIv5mshRWEc002fASmby8');


export const retryInvoice = functions.httpsCallable('retryInvoice');
export const cancelSubscription = functions.httpsCallable('cancelSubscription');

export default class PaymentAPI {
    static getAvaliablePrices = async () => {
        const prices = []
        // @todo need to fix if mutiple products are avaliable
        const productSnapshot = await db.collection('products').get();

        await Promise.all(productSnapshot.docs.map(async doc => {
            const priceSnapshot = await db.collection('products').doc(doc.id).collection('prices').orderBy('unit_amount').get();
            priceSnapshot.forEach(doc => {
                prices.push({ ...doc.data(), id: doc.id });
            });
        }));

        return prices;
    }

    static getLatestSubscription = async () => {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('You are not logged in!');
        }

        const querySnapshot = await db.collection('customers').doc(user.uid).collection('subscriptions').orderBy('created', 'desc').get();
        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            ...doc.data(),
            id: doc.id
        }
    }
}