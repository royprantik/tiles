import React, { useState } from 'react';
import { X, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TileCalculatorModal({ product, onClose, onInquire }) {
  const [length, setLength] = useState(12);
  const [width, setWidth] = useState(10);
  const [wastagePercent, setWastagePercent] = useState(10);
  const [tileSizeSqFt, setTileSizeSqFt] = useState(4); // Default 2x2 ft = 4 sq.ft per tile

  const pricePerSqFt = product && product.unit === 'sq.ft' ? product.price : 65;
  const netArea = Number(length || 0) * Number(width || 0);
  const wastageArea = (netArea * Number(wastagePercent)) / 100;
  const totalArea = Math.ceil(netArea + wastageArea);
  
  // Standard tile box has ~16 sq.ft (4 tiles of 2x2 ft)
  const sqFtPerBox = 16;
  const boxesNeeded = Math.ceil(totalArea / sqFtPerBox);
  const estimatedCost = totalArea * pricePerSqFt;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(217, 119, 6, 0.15)', color: 'var(--accent-gold-bright)', padding: '0.6rem', borderRadius: '10px' }}>
            <Calculator size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>Tile & Budget Calculator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {product ? `Calculating for: ${product.name} (₹${product.price}/sq.ft)` : 'Estimate room coverage & total cost'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Room Length (Feet)</label>
            <input 
              type="number"
              min="1"
              value={length}
              onChange={e => setLength(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Room Width (Feet)</label>
            <input 
              type="number"
              min="1"
              value={width}
              onChange={e => setWidth(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Include Cutting & Fitting Wastage</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[5, 10, 15].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => setWastagePercent(pct)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  background: wastagePercent === pct ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                  color: wastagePercent === pct ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {pct}% Margin
              </button>
            ))}
          </div>
        </div>

        {/* Results Card */}
        <div style={{ background: 'rgba(11, 15, 23, 0.8)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border-highlight)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Net Room Area</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>{netArea} sq.ft</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Required Area (w/ {wastagePercent}%)</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-gold-bright)' }}>{totalArea} sq.ft</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Boxes Needed (~16 sq.ft/box)</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>{boxesNeeded} Boxes</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated Cost</span>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#34d399' }}>₹{estimatedCost.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
            💡 Tip: Always keep 1 extra box in reserve for future tile maintenance or replacement.
          </div>
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => {
            onClose();
            if (onInquire) onInquire(product, `Calculated ${totalArea} sq.ft (${boxesNeeded} boxes) for ${length}x${width} ft room. Est. Cost: ₹${estimatedCost}`);
          }}
        >
          Book Order Inquiry with Calculation <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
