import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, Check, X, AlertTriangle, Package, DollarSign, Layers, RefreshCw } from 'lucide-react';

export default function AdminPortal({ 
  products, 
  adminToken, 
  onLogin, 
  onUpdateProduct, 
  onAddProduct, 
  onDeleteProduct,
  onRefresh
}) {
  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // New Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('floor-tiles');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('sq.ft');
  const [newStock, setNewStock] = useState('');
  const [newDimensions, setNewDimensions] = useState('2x4 ft (600x1200 mm)');
  const [newFinish, setNewFinish] = useState('High Gloss Polished');
  const [newMaterial, setNewMaterial] = useState('Vitrified Porcelain');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('/images/regal-white-marble.png');

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.token);
      } else {
        setLoginError(data.message || 'Invalid login details');
      }
    } catch (err) {
      setLoginError('Server error connecting to authentication API');
    } finally {
      setLoggingIn(false);
    }
  };

  // Start Inline Editing
  const startEdit = (p) => {
    setEditingId(p.id);
    setEditPrice(p.price);
    setEditStock(p.stock);
  };

  // Save Inline Edit
  const saveEdit = async (id) => {
    await onUpdateProduct(id, {
      price: Number(editPrice),
      stock: Number(editStock)
    });
    setEditingId(null);
  };

  // Handle Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    await onAddProduct({
      name: newName,
      category: newCategory,
      price: Number(newPrice),
      unit: newUnit,
      stock: Number(newStock),
      dimensions: newDimensions,
      finish: newFinish,
      material: newMaterial,
      description: newDescription,
      image: newImage
    });

    setShowAddModal(false);
    // Reset Form
    setNewName('');
    setNewPrice('');
    setNewStock('');
    setNewDescription('');
  };

  // If Not Authenticated, Render Login Screen
  if (!adminToken) {
    return (
      <div style={{ maxWidth: '440px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-amber))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 1rem', boxShadow: 'var(--shadow-gold)' }}>
              <ShieldCheck size={32} />
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '0.25rem' }}>Admin Portal Login</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>M R Tiles & Sanitation Manager Portal</p>
          </div>

          {loginError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} /> {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Username</label>
              <input 
                type="text"
                required
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 0.9rem', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Password</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 0.9rem', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              disabled={loggingIn}
            >
              {loggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              🔑 Default Credentials: Username: <code style={{ color: 'var(--accent-gold-bright)' }}>admin</code> | Password: <code style={{ color: 'var(--accent-gold-bright)' }}>admin123</code>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Calculate Dashboard Stats
  const totalItems = products.length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 10)).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  return (
    <div className="admin-container">
      {/* Header Bar */}
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff' }}>Stock & Price Control Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time inventory sync for M R Tiles & Sanitation catalog</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={onRefresh} style={{ padding: '0.6rem 1rem' }}>
            <RefreshCw size={16} /> Sync Catalog
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add New Tile / Item
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon total"><Package /></div>
          <div>
            <div className="stat-val">{totalItems}</div>
            <div className="stat-lbl">Active Products</div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon low"><AlertTriangle /></div>
          <div>
            <div className="stat-val" style={{ color: '#fbbf24' }}>{lowStockCount}</div>
            <div className="stat-lbl">Low Stock Warning</div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon out"><X /></div>
          <div>
            <div className="stat-val" style={{ color: '#f87171' }}>{outOfStockCount}</div>
            <div className="stat-lbl">Out of Stock Items</div>
          </div>
        </div>
      </div>

      {/* Inventory & Pricing Table */}
      <div className="admin-table-wrap glass-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item / Image</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock Level</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const isEditing = editingId === p.id;
              const isLowStock = p.stock > 0 && p.stock <= (p.minStock || 10);
              const isOutOfStock = p.stock <= 0;
              const statusLabel = isOutOfStock ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock');
              const statusClass = isOutOfStock ? 'out-of-stock' : (isLowStock ? 'low-stock' : 'in-stock');

              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <img src={p.image} alt={p.name} className="table-img" onError={(e) => { e.target.src = '/images/regal-white-marble.png'; }} />
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{p.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.dimensions}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.categoryLabel || p.category}</span>
                  </td>

                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ color: 'var(--accent-gold-bright)', fontWeight: '700' }}>₹</span>
                        <input 
                          type="number"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          style={{ width: '80px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent-gold)', borderRadius: '4px', padding: '0.3rem', color: '#fff', fontWeight: '700' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{p.unit}</span>
                      </div>
                    ) : (
                      <span style={{ fontWeight: '700', color: 'var(--accent-gold-bright)' }}>
                        ₹{p.price.toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/{p.unit}</span>
                      </span>
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input 
                        type="number"
                        value={editStock}
                        onChange={e => setEditStock(e.target.value)}
                        style={{ width: '80px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent-gold)', borderRadius: '4px', padding: '0.3rem', color: '#fff', fontWeight: '700' }}
                      />
                    ) : (
                      <span style={{ fontWeight: '600', color: '#fff' }}>
                        {p.stock} {p.unit}
                      </span>
                    )}
                  </td>

                  <td>
                    <span className={`stock-badge ${statusClass}`} style={{ position: 'static' }}>
                      {statusLabel}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {isEditing ? (
                        <>
                          <button className="btn-icon" style={{ background: '#10b981', color: '#fff' }} onClick={() => saveEdit(p.id)} title="Save changes">
                            <Check size={16} />
                          </button>
                          <button className="btn-icon" onClick={() => setEditingId(null)} title="Cancel edit">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn-icon" onClick={() => startEdit(p)} title="Edit price & stock">
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-icon delete" onClick={() => onDeleteProduct(p.id)} title="Delete item">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>

            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1.25rem' }}>Add New Product / Tile to Store</h3>

            <form onSubmit={handleCreateProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Product Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Italian Calacatta Marble"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Category *</label>
                  <select 
                    value={newCategory}
                    onChange={e => {
                      setNewCategory(e.target.value);
                      if (e.target.value.includes('tiles') || e.target.value.includes('kitchen')) setNewUnit('sq.ft');
                      else setNewUnit('piece');
                    }}
                    style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
                  >
                    <option value="floor-tiles">Floor Tiles</option>
                    <option value="wall-tiles">Wall Tiles</option>
                    <option value="bathroom-fittings">Bathroom Fittings</option>
                    <option value="kitchen-solutions">Kitchen Solutions</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Price (₹) *</label>
                  <input 
                    type="number"
                    required
                    placeholder="65"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Unit *</label>
                  <select 
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value)}
                    style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
                  >
                    <option value="sq.ft">per sq.ft</option>
                    <option value="piece">per piece</option>
                    <option value="box">per box</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Initial Stock *</label>
                  <input 
                    type="number"
                    required
                    placeholder="1000"
                    value={newStock}
                    onChange={e => setNewStock(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Dimensions</label>
                  <input 
                    type="text"
                    placeholder="2x4 ft (600x1200 mm)"
                    value={newDimensions}
                    onChange={e => setNewDimensions(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Finish & Polish</label>
                  <input 
                    type="text"
                    placeholder="High Gloss Polished"
                    value={newFinish}
                    onChange={e => setNewFinish(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Description</label>
                <textarea 
                  rows="2"
                  placeholder="Premium vitrified porcelain floor tile with anti-stain glaze..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', color: '#fff' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={18} /> Add Product to Inventory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
