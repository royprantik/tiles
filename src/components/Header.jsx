import React from 'react';
import { Layers, ShieldCheck, Sparkles, MapPin, Phone } from 'lucide-react';

export default function Header({ currentView, setCurrentView, adminToken, onLogout, onOpenAi }) {
  return (
    <header className="navbar">
      <div className="nav-content">
        <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('store')}>
          <div className="logo-icon">MR</div>
          <div>
            <div className="brand-title">M R TILES & SANITATION</div>
            <div className="brand-subtitle">Silchar, Assam • Premium Tiles & Sanitaryware</div>
          </div>
        </div>

        <div className="nav-links">
          <button 
            className={`nav-btn ${currentView === 'store' ? 'active' : ''}`}
            onClick={() => setCurrentView('store')}
          >
            <Layers size={18} />
            Showroom Catalog
          </button>

          <button className="nav-btn" onClick={onOpenAi}>
            <Sparkles size={18} style={{ color: 'var(--accent-gold-bright)' }} />
            AI Room Advisor
          </button>

          {adminToken ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
              >
                <ShieldCheck size={18} />
                Admin Dashboard
              </button>
              <button 
                className="btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="admin-nav-btn"
              onClick={() => setCurrentView('admin')}
            >
              <ShieldCheck size={18} />
              Admin Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
