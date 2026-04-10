import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: '329d2861d0c6f9e42c30',
  cluster: 'ap1',
  forceTLS: true,
  authEndpoint: 'https://sibol-web.onrender.com/broadcasting/auth',
  auth: {
    headers: {
      get Authorization() {
        return `Bearer ${localStorage.getItem('authToken')}`;
      },
      Accept: 'application/json',
    },
  },
});

export default echo;
