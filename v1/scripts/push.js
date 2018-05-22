/* Push Notification Handler */

const DOM_Push = {};

const TEMP_Push = {}
TEMP_Push.button = ({ status }) => `Notifications &nbsp <img src="icons/button/switch-${status}.png" />`;

//const applicationServerPublicKey = 'BM2e4iaBRYGSs5I_jXJaXLY6p5_koeOKXK0MbPEsoTIpyrj0rZx3rDUtZ05ueOqn-Cl6W5HrxonQUHlUZtwJA9I';
const applicationServerPublicKey = 'BGwoGYtRfMl2E8aBtyJZJskhYuq4wtfczu-OCK1swClArSRdE6LoOqcLWTKEqFUHa8Thhpq0UJQIu4HsMGoLBZk';

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function initializeUI() {
    DOM_Push.button.removeClass("disabled");

    DOM_Push.button.click(function() {
        if (isSubscribed) {
          unsubscribeUser();
        } else {
          subscribeUser();
        }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
        isSubscribed = !(subscription === null);

        updateSubscriptionOnServer(subscription);

        if (isSubscribed) {
            console.log('User IS subscribed.');
        } else {
            console.log('User is NOT subscribed.');
        }

        updateBtn();
    });
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        console.log("Push messaging blocked by browser!");
        disableBtn("Error: Push Messaging blocked. Please contact IT staff");
        updateSubscriptionOnServer(null);
        return;
    }

    if (isSubscribed) {
        DOM_Push.button.html(TEMP_Push.button({status: "on"}));
    } else {
        DOM_Push.button.html(TEMP_Push.button({status: "off"}));
    }

    $("body").removeClass("loading");
}

function subscribeUser() {
    $("body").addClass("loading");

    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
        console.log('User is subscribed.');

        updateSubscriptionOnServer(subscription);

        isSubscribed = true;

        updateBtn();
    })
    .catch(function(err) {
        console.log('Failed to subscribe the user: ', err);
        updateBtn();
    });
}

function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server, for now will just print subscription
    console.log("Subscription: " + JSON.stringify(subscription));
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
        if (subscription) {
            return subscription.unsubscribe();
        }
    })
    .catch(function(error) {
        console.log('Error unsubscribing', error);
    })
    .then(function() {
        updateSubscriptionOnServer(null);

        console.log('User is unsubscribed.');
        isSubscribed = false;

        updateBtn();
    });
}

function disableBtn(message) {
    DOM_Push.button.html(TEMP_Push.button({status: "disabled"}));
    DOM_Push.button.addClass("disabled");

    DOM_Push.button.prop("title", message);

    DOM_Push.button.off();
}

$( document ).ready(function() {
    DOM_Push.button = $("#js-push-button");
    //DOM_Push.debug = $("#js-push-debug");

    /*register service worker and enable button if browser supports push notifications*/
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        navigator.serviceWorker.register('scripts/sw.js')
        .then(function(swReg) {
            console.log('Service Worker registered', swReg);

            swRegistration = swReg;
            initializeUI() ;
        })
        .catch(function(error) {
            disableBtn("Error: Error enabling push notifications. Please contact IT staff");
            console.error('Service Worker Error', error);
        });

    } else {
        disableBtn("Error: Push Messaging not supported in your current browser");
        console.warn('Push messaging is not supported');
    }

});
