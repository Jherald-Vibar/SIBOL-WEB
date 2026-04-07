import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT,
  wssPort: import.meta.env.VITE_REVERB_PORT,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: 'http://127.0.0.1:8000/api/broadcasting/auth',
  auth: {
    headers: {
      // ✅ Arrow function - reads token fresh every auth request
      get Authorization() {
        return `Bearer ${localStorage.getItem('authToken')}`;
      },
      Accept: 'application/json',
    },
  },
});

export default echo;
