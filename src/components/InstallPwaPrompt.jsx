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
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      background: 'var(--bg-card, #1e293b)',
      color: 'var(--text-main, #ffffff)',
      border: '1px solid var(--border-color, #334155)',
      borderRadius: '12px',
      padding: '1rem 1.25rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '380px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--primary, #3b82f6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Smartphone size={22} color="white" />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Install Aarambh App</h4>
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
          Add to Home Screen for fast mobile access & offline notes.
        </p>
      </div>
      <button 
        onClick={handleInstallClick} 
        style={{
          background: 'var(--primary, #3b82f6)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem 0.85rem',
          fontWeight: 600,
          fontSize: '0.8rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <Download size={14} /> Install
      </button>
      <button 
        onClick={() => setShowPrompt(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted, #94a3b8)',
          cursor: 'pointer',
          padding: '2px'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default InstallPwaPrompt;
