//OneSignal initialiser//

var OneSignal = window.OneSignal || [];
OneSignal.push(function() {
  console.log('onesignal is initialised');
  OneSignal.init({
    appId: "a704a88e-9e37-41f6-99b8-6ded41926c03",
    autoRegister: true,
    notifyButton: {
      enable: false,
    },
    notificationClickHandlerMatch: 'origin',
    notificationClickHandlerAction: 'focus',

  });
});

if (OneSignal.installServiceWorker) {
  OneSignal.installServiceWorker();
} else {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/OneSignalSDKWorker.js?appId=a704a88e-9e37-41f6-99b8-6ded41926c03');
  }
}

OneSignal.sendTags({
   key: API.login.signoff.signoff_role,

 }).then(function(tagsSent) {
   console.log('tag set as ' API.login.signoff.signoff_role)
 });
});
