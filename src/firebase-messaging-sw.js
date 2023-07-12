import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.1/firebase-app.js';
import { getMessaging, onBackgroundMessage, isSupported } from 'https://www.gstatic.com/firebasejs/9.0.1/firebase-messaging-sw.js';

const app = initializeApp({
  apiKey: 'AIzaSyA7CNE9aHbcSEbt9y03QReJ-Xr0nwKg7Yg',
  authDomain: 'aftest-94085.firebaseapp.com',
  databaseURL: 'https://aftest-94085.firebaseio.com',
  projectId: 'aftest-94085',
  storageBucket: 'aftest-94085.appspot.com',
  messagingSenderId: '480362569154',
  appId: '1:480362569154:web:2fe6f75104cdfb82f50a5b',
  measurementId: 'G-CBRYER9PJR'
});

self.addEventListener('notificationclick', function(event) {
  // event.notification.close();
  console.log('notification click');
});
self.addEventListener('push', function(event) {
  console.log('notification click');
});
isSupported().then(isSupported => {

  if (isSupported) {

    const messaging = getMessaging(app);

    // self.addEventListener('notificationclick', function(event) {
    //   event.notification.close();
    //   console.log('notification click');
    // });


    /*onBackgroundMessage(messaging, (payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      // Customize notification here
      const notificationTitle = 'Incoming Call';
      const notificationOptions = {
        body: `${payload.data.name} \n${payload.data.number} is calling...`,
        icon: '/assets/img/logo-img.svg'
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    });*/
    onBackgroundMessage(messaging, ({ notification: { title, body, image } }) => {
      console.log(title, body);
      self.registration.showNotification(title, { body, icon: image || '/assets/img/logo-img.svg' });
    });

  } else {
    console.log('not supported');
  }

});
