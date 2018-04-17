self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Push CodeStroke';
  const options = {
    body: 'Test successful.',
  };

  const notificationPromise = self.registration.showNotification(title, options);

});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
/* change as needed */
    clients.openWindow('http://www.austin.org.au/')
  );
});
