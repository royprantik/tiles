import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

export default function InquiryModal({ product, initialNote, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(initialNote || '');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          productInterest: product ? product.name : 'General Inquiry'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={56} style={{ color: '#34d399', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>Inquiry Received!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Thank you, {name}. Our sales representative from M R Tiles & Sanitation will call you at {phone} with best trade discounts.
            </p>
            <button className="btn-secondary" onClick={onClose}>Close Window</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.35rem' }}>Request Quote & Best Price</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {product ? `Inquiring about: ${product.name} (₹${product.price}/${product.unit})` : 'Get in touch with our Silchar showroom team'}
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Your Full Name *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Rahul Roy"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Phone / WhatsApp Number *</label>
              <input 
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Email Address (Optional)</label>
              <input 
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Project Details / Notes</label>
              <textarea 
                rows="3"
                placeholder="Room size, delivery date, discount request..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff', fontFamily: 'inherit' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Send Inquiry to Showroom'} <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
