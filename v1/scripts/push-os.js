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
              OneSignal.push(function() {
                OneSignal.setSubscription(false);
              });

              DOM_Push.button.html(TEMP_Push.button({status: "off"}))
              console.log('User is no longer subscribed');
          } else {
              if (state.isOptedOut) {
                  /* Opted out, opt them back in */
                  OneSignal.setSubscription(true)
                  DOM_Push.button.html(TEMP_Push.button({status: "on"}));
                  console.log('User is now subscribed');
              } else {
                  /* Unsubscribed, subscribe them */
                  OneSignal.push(function() {
                    OneSignal.registerForPushNotifications;
                  });

              }
          }
      });

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

function disableBtn(message) {
    DOM_Push.button.html(TEMP_Push.button({status: "disabled"}));
    DOM_Push.button.addClass("disabled");

    DOM_Push.button.prop("title", message);

    DOM_Push.button.off();
}

function updateBtn()
    getSubscriptionState().then(function(state) {
        if (state.isPushEnabled) {
            DOM_Push.button.html(TEMP_Push.button({status: "on"}))
            console.log('User currently subscribed');
        } else {
            if (state.isOptedOut) {
                DOM_Push.button.html(TEMP_Push.button({status: "off"}));
                console.log('User is currently unsubscribed');
            }
        }
    }


$( document ).ready(function() {
    DOM_Push.button = $("#js-push-button");

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
