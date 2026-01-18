import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClientAuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuth = () => {
      try {
        const params = new URLSearchParams(location.search);
        const encodedUser = params.get('user');
        
        if (!encodedUser) {
          navigate(createPageUrl('ClientLogin'));
          return;
        }

        // Decode user data
        const userData = JSON.parse(atob(encodedUser));
        
        if (!userData?.id) {
          throw new Error('Invalid user data');
        }

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect to dashboard
        window.location.href = '/ClientDashboard';
      } catch (error) {
        console.error('Auth handler error:', error);
        navigate(createPageUrl('ClientLogin') + '?error=' + encodeURIComponent(error.message));
      }
    };

    handleAuth();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <p className="text-lg text-gray-700">מתחבר למערכת...</p>
      </div>
    </div>
  );
}