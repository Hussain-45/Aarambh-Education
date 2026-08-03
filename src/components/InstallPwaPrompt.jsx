import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

const InstallPwaPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);

      // Auto disappear after 10 seconds if not clicked
      const timer = setTimeout(() => {
        setShowPrompt(false);
      }, 10000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '15px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 99999,
      background: 'rgba(30, 41, 59, 0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '16px',
      padding: '0.85rem 1.1rem',
      boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
      width: '92%',
      maxWidth: '420px',
      animation: 'slideDownFade 0.4s ease-out'
    }}>
      <style>{`
        @keyframes slideDownFade {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Smartphone size={22} color="white" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Install Aarambh App
        </h4>
        <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.2 }}>
          Add to Home Screen for fast mobile access.
        </p>
      </div>
      <button 
        onClick={handleInstallClick} 
        style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          padding: '0.55rem 0.95rem',
          fontWeight: 700,
          fontSize: '0.78rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          flexShrink: 0
        }}
      >
        <Download size={14} /> Install
      </button>
      <button 
        onClick={() => setShowPrompt(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px',
          flexShrink: 0
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default InstallPwaPrompt;
