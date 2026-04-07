import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token    = params.get('token');
    const role     = params.get('role');
    const error    = params.get('error');
    const name     = params.get('name');
    const email    = params.get('email');
    const image    = params.get('image');
    const googleId = params.get('google_id');

    if (error) {
      setStatus('Something went wrong. Redirecting...');
      setTimeout(() => navigate('/guest/login?error=' + encodeURIComponent(error)), 1500);
      return;
    }

    if (token) {
      localStorage.setItem('authToken',  token);
      localStorage.setItem('role',       role);
      localStorage.setItem('username',   name     || '');
      localStorage.setItem('email',      email    || '');
      localStorage.setItem('image',      image    || '');
      localStorage.setItem('google_id',  googleId || '');

      setStatus('Welcome back! Redirecting...');
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin/crop-profile' : '/user/dashboard');
      }, 800);
    } else {
      setStatus('No token found. Redirecting...');
      setTimeout(() => navigate('/guest/login'), 1500);
    }
  }, []);
};

export default AuthCallback;
