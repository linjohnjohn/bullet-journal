import React from 'react';
import { IoMdSync } from 'react-icons/io';
import { loadStripe } from '@stripe/stripe-js';
import firebase from 'firebase';

import './Payment.css';
import PaymentAPI from '../models/PaymentAPI';
import moment from 'moment';

const db = firebase.firestore();
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51H9HKWDQRGzRjAZt09f7AwRkSY75cSPJEucNPilVVY7WoP0T922MklVl66WlwIaf0Lxc9LTWEcLiHtIv5mshRWEc002fASmby8');


export default class Payment extends React.Component {
    state = {
        subscription: null,
        prices: null,
        buttonDisabled: false
    }

    async componentDidMount() {
        const subscription = await PaymentAPI.getLatestSubscription();
        this.setState({ subscription });

        if (!subscription) {
            const prices = await PaymentAPI.getAvaliablePrices();
            this.setState({ prices });
        }
    }

    handleRedirect = async () => {
        this.setState({ buttonDisabled: true });
        const functionRef = firebase.app().functions('us-central1').httpsCallable('ext-firestore-stripe-subscriptions-createPortalLink');
        const { data } = await functionRef({ returnUrl: window.location.href });
        window.location.assign(data.url);
    }

    handleSelect = async (price_id) => {
        this.setState({ buttonDisabled: true });
        const stripe = await stripePromise;
        const currentUser = firebase.auth().currentUser;
        const docRef = await db.collection('customers').doc(currentUser.uid)
            .collection('checkout_sessions').add({
                price: price_id,
                success_url: window.location.href,
                cancel_url: window.location.href,
            });

        // Wait for the CheckoutSession to get attached by the extension
        docRef.onSnapshot((snap) => {
            const { sessionId } = snap.data();
            if (sessionId) {
                // We have a session, let's redirect to Checkout
                // Init Stripe
                stripe.redirectToCheckout({ sessionId });
            }
        });
    }

    render() {
        const { prices, subscription, buttonDisabled } = this.state;
        let subscriptionDisplay = null;

        if (subscription) {
            const { cancel_at_period_end, status, cancel_at } = subscription;

            subscriptionDisplay = <div className="subscription-status-container">
                <div className="subscription-status">
                    Your subscription is {status}!
                </div>
                {cancel_at_period_end ?
                    <div class="subscription-status-detail">
                        Your subscription will end on {moment(cancel_at.toDate()).format('MMM, D YYYY')}, and you will no longer be charged.
                    </div> : null
                }
                <button
                    disabled={buttonDisabled}
                    className="btn btn-inverse full-width"
                    onClick={this.handleRedirect}>
                    {buttonDisabled ? <IoMdSync className="icon icon-spinner"></IoMdSync> : 'Manage Subscription'}
                </button>
            </div>
        }

        return <div className="payment-container">
            <div className="d-flex flex-column align-items-center">
                {subscriptionDisplay ? subscriptionDisplay :
                    <div className="d-flex flex-row justify-content-center flex-grow-1 subscription-selection">
                        {prices ?
                            prices.map(({ interval, unit_amount, trial_period_days, id }) => {
                                let displayInterval;
                                let monthlyPrice;

                                if (interval === 'month') {
                                    displayInterval = 'Monthly';
                                    monthlyPrice = unit_amount
                                } else {
                                    displayInterval = 'Annually';
                                    monthlyPrice = unit_amount / 12
                                }

                                return <div className="flex-grow-1 subscription-option">
                                    <div className="subscription-name">{displayInterval}</div>
                                    <div className="subscription-price">${Number.parseFloat(monthlyPrice / 100).toFixed(2)}</div>
                                    <div className="subscription-detail">Per month</div>
                                    <div className="subscription-detail">Billed {displayInterval}</div>
                                    <div className="d-flex flex-row justify-content-center">
                                        <button disabled={buttonDisabled} className="btn subscription-button m-3 btn-inverse" onClick={() => this.handleSelect(id)}>{buttonDisabled ? <IoMdSync className="icon icon-spinner"></IoMdSync> : 'Try It Free'}</button>
                                    </div>
                                    <div className="subscription-detail">Try it free for {trial_period_days} days</div>
                                </div>
                            })
                            : <div className="d-flex flex-column align-items-center">
                                <IoMdSync className="icon icon-xl icon-spinner"></IoMdSync>
                                <div>Fetching Avaliable Plans</div>
                            </div>}
                    </div>
                }
            </div>
        </div>
    }
}

