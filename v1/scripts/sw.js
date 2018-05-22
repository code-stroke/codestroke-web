self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);


  var title = 'CodeStroke';
  var body = event.data.text();
  var icon = '../icons/logo.png';
  var tag = 'tag1';


  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      tag: tag,
    })
  );
});


self.addEventListener('notificationclick', function(event) {
   console.log('[Service Worker] Notification click Received.');

   event.notification.close();

   event.waitUntil(
      /* clients.openWindow('http://www.austin.org.au/') */
      clients.openWindow('http://127.0.0.1:8887/v1/')


   );
});
