import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import CustomerStore from './components/CustomerStore.jsx';
import AdminPortal from './components/AdminPortal.jsx';
import TileCalculatorModal from './components/TileCalculatorModal.jsx';
import InquiryModal from './components/InquiryModal.jsx';
import AiAssistant from './components/AiAssistant.jsx';
import { DEFAULT_PRODUCTS } from './data/defaultProducts.js';

export default function App() {
  const [currentView, setCurrentView] = useState('store'); // 'store' | 'admin'
  const [allProducts, setAllProducts] = useState(DEFAULT_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(DEFAULT_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Admin Token State
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('mr_admin_token') || '');

  // Modal States
  const [calcProduct, setCalcProduct] = useState(null);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [inquireProduct, setInquireProduct] = useState(null);
  const [inquireNote, setInquireNote] = useState('');
  const [showInquireModal, setShowInquireModal] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Fetch Products with Fallback
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.products && data.products.length > 0) {
          setAllProducts(data.products);
          return;
        }
      }
    } catch (err) {
      console.warn('API endpoint not available, using offline catalog fallback.');
    }
    // Fallback to initial local state
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on active category and search query
  useEffect(() => {
    let result = [...allProducts];

    if (activeCategory && activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.finish && p.finish.toLowerCase().includes(q))
      );
    }

    setFilteredProducts(result);
  }, [allProducts, activeCategory, search]);

  // Admin Login Handler
  const handleAdminLogin = (token) => {
    setAdminToken(token);
    localStorage.setItem('mr_admin_token', token);
    setCurrentView('admin');
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    setAdminToken('');
    localStorage.removeItem('mr_admin_token');
    setCurrentView('store');
  };

  // Admin Update Product
  const handleUpdateProduct = async (id, updatePayload) => {
    // Try Server Update
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updatePayload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchProducts();
          return;
        }
      }
    } catch (err) {}

    // Fallback Client Update
    setAllProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatePayload } : p));
  };

  // Admin Add Product
  const handleAddProduct = async (productData) => {
    const categoryLabels = {
      'floor-tiles': 'Floor Tiles',
      'wall-tiles': 'Wall Tiles',
      'bathroom-fittings': 'Bathroom Fittings',
      'kitchen-solutions': 'Kitchen Solutions'
    };

    const newProd = {
      id: 'prod_' + Date.now(),
      ...productData,
      categoryLabel: categoryLabels[productData.category] || productData.category,
      minStock: productData.category.includes('tiles') ? 100 : 5
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchProducts();
          return;
        }
      }
    } catch (err) {}

    // Fallback Client Add
    setAllProducts(prev => [newProd, ...prev]);
  };

  // Admin Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from stock inventory?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchProducts();
          return;
        }
      }
    } catch (err) {}

    // Fallback Client Delete
    setAllProducts(prev => prev.filter(p => p.id !== id));
  };

  // Open Calculator Modal
  const openCalculator = (product) => {
    setCalcProduct(product);
    setShowCalcModal(true);
  };

  // Open Inquiry Modal
  const openInquiry = (product, note = '') => {
    setInquireProduct(product);
    setInquireNote(note);
    setShowInquireModal(true);
  };

  return (
    <div className="app-container">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        adminToken={adminToken}
        onLogout={handleAdminLogout}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {currentView === 'store' ? (
        <CustomerStore 
          products={filteredProducts}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          search={search}
          setSearch={setSearch}
          onOpenCalc={openCalculator}
          onInquire={openInquiry}
        />
      ) : (
        <AdminPortal 
          products={allProducts}
          adminToken={adminToken}
          onLogin={handleAdminLogin}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onRefresh={fetchProducts}
        />
      )}

      {/* Modals */}
      {showCalcModal && (
        <TileCalculatorModal 
          product={calcProduct}
          onClose={() => setShowCalcModal(false)}
          onInquire={(p, note) => openInquiry(p, note)}
        />
      )}

      {showInquireModal && (
        <InquiryModal 
          product={inquireProduct}
          initialNote={inquireNote}
          onClose={() => setShowInquireModal(false)}
        />
      )}

      {/* Floating AI Assistant */}
      <AiAssistant 
        isOpen={isAiOpen}
        setIsOpen={setIsAiOpen}
        onOpenCalc={openCalculator}
        onInquire={openInquiry}
        allProducts={allProducts}
      />

      <footer className="footer">
        <div className="footer-content">
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>M R TILES AND SANITATION</h4>
            <p style={{ fontSize: '0.85rem' }}>
              Your trusted partner for residential & commercial flooring, wall cladding, and luxury bathroom sanitaryware.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Showroom Address</h4>
            <p style={{ fontSize: '0.85rem' }}>
              Trinayani Ln, near Karan TVS Showroom,<br />
              Kanakpur, Silchar, Assam - 788006
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Stock & Sales Desk</h4>
            <p style={{ fontSize: '0.85rem' }}>
              Phone: +91 60013 99842<br />
              Mon - Sat: 9:30 AM - 8:00 PM
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} M R TILES AND SANITATION. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
