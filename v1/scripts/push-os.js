//push UI handler//

function onManageWebPushSubscriptionButtonClicked(event) {
    getSubscriptionState().then(function(state) {
        if (state.isPushEnabled) {
            /* Subscribed, opt them out */
            DOM_Push.button.html(TEMP_Push.button({status: "on"}))
            OneSignal.setSubscription(false);
        } else {
            if (state.isOptedOut) {
                /* Opted out, opt them back in */
                OneSignal.setSubscription(true)
                DOM_Push.button.html(TEMP_Push.button({status: "off"}));
            } else {
                /* Unsubscribed, subscribe them */
                OneSignal.registerForPushNotifications()
                DOM_Push.button.html(TEMP_Push.button({status: "off"}));
            }
        }
    });
    event.preventDefault();
}

function updateMangeWebPushSubscriptionButton(buttonSelector) {
    var hideWhenSubscribed = false;
    var subscribeText = "Subscribe to Notifications";
    var unsubscribeText = "Unsubscribe from Notifications";

    getSubscriptionState().then(function(state) {
        var buttonText = !state.isPushEnabled || state.isOptedOut ? subscribeText : unsubscribeText;

        var element = document.querySelector(buttonSelector);
        if (element === null) {
            return;
        }

        element.removeEventListener('click', onManageWebPushSubscriptionButtonClicked);
        element.addEventListener('click', onManageWebPushSubscriptionButtonClicked);
        element.textContent = buttonText;

        if (state.hideWhenSubscribed && state.isPushEnabled) {
            element.style.display = "none";
        } else {
            element.style.display = "";
        }
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

var OneSignal = OneSignal || [];
var buttonSelector = "js-push-button";

/* This example assumes you've already initialized OneSignal */
OneSignal.push(function() {
    // If we're on an unsupported browser, do nothing
    if (!OneSignal.isPushNotificationsSupported()) {
        console.log("Push messaging blocked by browser!");
        disableBtn("Error: Push Messaging blocked. Please contact IT staff");
        updateSubscriptionOnServer(null);
        return;
    }
    updateMangeWebPushSubscriptionButton(buttonSelector);
    OneSignal.on("subscriptionChange", function(isSubscribed) {
        /* If the user's subscription state changes during the page's session, update the button text */
        updateMangeWebPushSubscriptionButton(buttonSelector);
    });
});
