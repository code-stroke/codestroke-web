/* Push Notification Handler */

const DOM_Push = {};
//const applicationServerPublicKey = 'BM2e4iaBRYGSs5I_jXJaXLY6p5_koeOKXK0MbPEsoTIpyrj0rZx3rDUtZ05ueOqn-Cl6W5HrxonQUHlUZtwJA9I';
const applicationServerPublicKey = 'BKpA7tIFwqYgl7bw-TbVAAp9D9bjJkUZiOh_Sj9A9TqqJC4iKNThi4SNK064afo-h9l6JCJRaXy_Xw17IyvyQpg';

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
    DOM_Push.button.children().removeClass("disabled");

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
        DOM_Push.status.text("On");
        DOM_Push.status.addClass("on");
        DOM_Push.status.removeClass("off");
    } else {
        DOM_Push.status.text("Off");
        DOM_Push.status.addClass("off");
        DOM_Push.status.removeClass("on");
    }
}

function subscribeUser() {
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
    DOM_Push.debug.text(JSON.stringify(subscription));
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
    DOM_Push.status.text("Disabled");
    DOM_Push.status.removeClass("on off");

    DOM_Push.button.prop("title", message);
    DOM_Push.button.children().addClass("disabled");

    DOM_Push.button.off();
}

$( document ).ready(function() {
    DOM_Push.button = $("#js-push-button");
    DOM_Push.status = DOM_Push.button.find(".push_status");
    DOM_Push.debug = $("#js-push-debug");

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
