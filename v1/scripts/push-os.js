/* Push Notification Handler */

const DOM_Push = {};

const TEMP_Push = {}
TEMP_Push.button = ({ status }) => `Notifications &nbsp <img src="icons/button/switch-${status}.png" />`;



function initializeUI() {
    DOM_Push.button.removeClass("disabled");

    DOM_Push.button.click(function() {
      getSubscriptionState().then(function(state) {
          if (state.isPushEnabled) {
              /* Subscribed, opt them out */
              OneSignal.setSubscription(false)
              console.log('User is no longer subscribed');
          } else {
              if (state.isOptedOut) {
                  /* Opted out, opt them back in */
                  OneSignal.setSubscription(true)
                  console.log('User is now subscribed');
              } else {
                  /* Unsubscribed, subscribe them */
                  OneSignal.registerForPushNotifications();
              }
          }
      });
      updateBtn()
      event.preventDefault();
    });

}

function getSubscriptionState() {
    return Promise.all([
      OneSignal.isPushNotificationsEnabled(),
      OneSignal.isOptedOut()
    ]).then(function(result) {
        var isPushEnabled = result[0];
        var isOptedOut = result[1];

        return {
            isPushEnabled: isPushEnabled,
            isOptedOut: isOptedOut
        };
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
        console.log('Service Worker and Push is supported')
        OneSignal.registerForPushNotifications()
        initializeUI();

    } else {
        disableBtn("Error: Push Messaging not supported in your current browser");
        console.warn('Push messaging is not supported');
    }

});
