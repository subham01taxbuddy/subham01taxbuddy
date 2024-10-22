self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
  });
  
  self.addEventListener('push', (event) => {
    const options = {
      body: event.data.text(),
      icon: 'assets/img/profile.webp',
      badge: 'assets/img/badge-icon.png',
      requireInteraction: true,
      data: JSON.parse(event.data.text())
    };
  
    event.waitUntil(
      self.registration.showNotification('New Chat Message', options)
    );
  });
  
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
  
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          if (clientList.length > 0) {
            let client = clientList[0];
            for (let i = 0; i < clientList.length; i++) {
              if (clientList[i].focused) {
                client = clientList[i];
              }
            }
            return client.focus();
          }
          return clients.openWindow('/');
        })
    );
  });