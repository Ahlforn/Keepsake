import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    if (token) {
      setToken(token);
      refresh().then(() => navigate('/', { replace: true }));
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, refresh]);

  return (
    <div className="flex h-screen items-center justify-center text-muted">
      <span className="animate-pulse">Signing you in…</span>
    </div>
  );
}
