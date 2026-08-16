import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

// Path to persistent data store
const DATA_FILE = path.join(__dirname, 'data', 'products.json');
const INQUIRIES_FILE = path.join(__dirname, 'data', 'inquiries.json');

// Helper to read products
function getProducts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading products:', err);
  }
  return [];
}

// Helper to write products
function saveProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing products:', err);
    return false;
  }
}

// Admin tokens (in-memory session map)
const ADMIN_TOKENS = new Set();

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    const token = 'mr_admin_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    ADMIN_TOKENS.add(token);
    return res.json({
      success: true,
      token,
      admin: { username: 'admin', role: 'Store Administrator' },
      message: 'Login successful'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin credentials'
  });
});

// Admin Verify Token
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : req.headers['x-admin-token'];
  
  if (token && ADMIN_TOKENS.has(token)) {
    return res.json({ valid: true });
  }
  return res.status(401).json({ valid: false });
});

// Admin Auth Middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : req.headers['x-admin-token'];
  
  if (token && ADMIN_TOKENS.has(token)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Unauthorized. Admin session required.' });
}

// Public: Get Catalog Products
app.get('/api/products', (req, res) => {
  let products = getProducts();
  const { category, search } = req.query;

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.finish && p.finish.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: products.length, products });
});

// Public: Get Single Product
app.get('/api/products/:id', (req, res) => {
  const products = getProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

// Admin: Add New Product
app.post('/api/products', requireAdmin, (req, res) => {
  const products = getProducts();
  const { name, category, price, unit, stock, dimensions, finish, material, description, image } = req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide name, category, price, and stock count.' });
  }

  const categoryLabels = {
    'floor-tiles': 'Floor Tiles',
    'wall-tiles': 'Wall Tiles',
    'bathroom-fittings': 'Bathroom Fittings',
    'kitchen-solutions': 'Kitchen Solutions'
  };

  const newProduct = {
    id: 'prod_' + Date.now(),
    name,
    category,
    categoryLabel: categoryLabels[category] || category,
    price: Number(price),
    unit: unit || (category.includes('tiles') || category.includes('kitchen') ? 'sq.ft' : 'piece'),
    stock: Number(stock),
    minStock: category.includes('tiles') ? 100 : 5,
    dimensions: dimensions || 'Standard Size',
    finish: finish || 'Premium Finish',
    material: material || 'Vitrified / Ceramic',
    image: image || '/images/regal-white-marble.png',
    description: description || 'High quality product from M R Tiles & Sanitation.'
  };

  products.unshift(newProduct);
  if (saveProducts(products)) {
    return res.status(201).json({ success: true, product: newProduct, message: 'Product added to stock inventory successfully!' });
  } else {
    return res.status(500).json({ success: false, message: 'Failed to save product.' });
  }
});

// Admin: Update Stock & Price
app.put('/api/products/:id', requireAdmin, (req, res) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const existing = products[index];
  const updated = {
    ...existing,
    name: req.body.name !== undefined ? req.body.name : existing.name,
    category: req.body.category !== undefined ? req.body.category : existing.category,
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
    unit: req.body.unit !== undefined ? req.body.unit : existing.unit,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : existing.stock,
    dimensions: req.body.dimensions !== undefined ? req.body.dimensions : existing.dimensions,
    finish: req.body.finish !== undefined ? req.body.finish : existing.finish,
    material: req.body.material !== undefined ? req.body.material : existing.material,
    description: req.body.description !== undefined ? req.body.description : existing.description,
    image: req.body.image !== undefined ? req.body.image : existing.image
  };

  products[index] = updated;
  if (saveProducts(products)) {
    return res.json({ success: true, product: updated, message: 'Product details, price, and stock updated!' });
  } else {
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// Admin: Delete Product
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  let products = getProducts();
  const initialLen = products.length;
  products = products.filter(p => p.id !== req.params.id);

  if (products.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (saveProducts(products)) {
    return res.json({ success: true, message: 'Product deleted from inventory.' });
  } else {
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// Public: Customer Inquiry / Quote Request
app.post('/api/inquiries', (req, res) => {
  const { name, phone, email, message, productInterest } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone number are required.' });
  }

  let inquiries = [];
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
    }
  } catch (e) {}

  const newInquiry = {
    id: 'inq_' + Date.now(),
    name,
    phone,
    email: email || '',
    message: message || '',
    productInterest: productInterest || 'General Inquiry',
    date: new Date().toISOString()
  };

  inquiries.unshift(newInquiry);
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));

  res.status(201).json({ success: true, message: 'Thank you! M R Tiles & Sanitation team will contact you shortly.' });
});

// AI Sales & Tile Advisor Endpoint
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  const query = (message || '').toLowerCase();
  const products = getProducts();

  let reply = "";
  let suggestedProducts = [];

  // Tile coverage math detection
  const dimMatch = query.match(/(\d+)\s*(?:x|by|\*)\s*(\d+)/i);
  if (dimMatch && (query.includes('cost') || query.includes('sq.ft') || query.includes('room') || query.includes('tile') || query.includes('price') || query.includes('box'))) {
    const l = parseFloat(dimMatch[1]);
    const w = parseFloat(dimMatch[2]);
    const area = l * w;
    const areaWithWastage = Math.ceil(area * 1.1); // 10% wastage
    const tilePriceAvg = 65; // average price/sq.ft
    const boxSqFt = 16; // 4 tiles of 2x2ft
    const boxesNeeded = Math.ceil(areaWithWastage / boxSqFt);
    const estimatedCost = areaWithWastage * tilePriceAvg;

    reply = `For a room of **${l} ft × ${w} ft** (${area} sq.ft total area):\n\n` +
      `• **Net Area**: ${area} sq.ft\n` +
      `• **Total Area with 10% Wastage**: ~${areaWithWastage} sq.ft\n` +
      `• **Estimated Box Count (2×2 ft tiles)**: ~${boxesNeeded} boxes (${boxesNeeded * boxSqFt} sq.ft)\n` +
      `• **Estimated Cost (at avg ₹65/sq.ft)**: ₹${estimatedCost.toLocaleString('en-IN')}\n\n` +
      `Here are recommended floor tiles available in our showroom stock:`;

    suggestedProducts = products.filter(p => p.category === 'floor-tiles').slice(0, 2);
  } else if (query.includes('bathroom') || query.includes('basin') || query.includes('commode') || query.includes('toilet') || query.includes('fitting')) {
    reply = `For modern bathroom solutions at M R Tiles & Sanitation, we recommend matching wall-hung sanitaryware with anti-skid floor tiles:\n\n` +
      `• **Sanitaryware**: Modern Wall Hung Basins (from ₹4,850) and Smart Rimless Commodes (from ₹6,950).\n` +
      `• **Wall Tiles**: Glossy ceramic 1×2 ft tiles for easy cleaning and water stain resistance.\n` +
      `• **Floor**: Matte anti-skid finish porcelain tiles for safety.`;

    suggestedProducts = products.filter(p => p.category === 'bathroom-fittings' || p.category === 'wall-tiles').slice(0, 3);
  } else if (query.includes('white') || query.includes('marble') || query.includes('regal')) {
    reply = `Our **Regal White Marble** vitrified tiles (₹65/sq.ft) are one of our top sellers! They feature high-gloss polished surfaces with subtle grey and gold veining that makes living rooms look expansive and radiant.`;
    suggestedProducts = products.filter(p => p.id === 'prod_1' || p.category === 'floor-tiles').slice(0, 2);
  } else if (query.includes('grey') || query.includes('moroccan')) {
    reply = `Our **Moroccan Grey** tiles (₹55/sq.ft) offer a contemporary satin matt finish. Perfect for anti-slip durability in high-traffic corridors, living spaces, and offices.`;
    suggestedProducts = products.filter(p => p.id === 'prod_2' || p.category === 'floor-tiles').slice(0, 2);
  } else if (query.includes('contact') || query.includes('address') || query.includes('showroom') || query.includes('phone') || query.includes('location')) {
    reply = `📍 **M R Tiles and Sanitation Showroom Details**:\n` +
      `• **Address**: Trinayani Ln, near Karan TVS Showroom, Kanakpur, Silchar, Assam - 788006\n` +
      `• **Phone / WhatsApp**: +91 60013 99842\n` +
      `• **Hours**: Mon - Sat (9:30 AM to 8:00 PM)\n\n` +
      `Feel free to drop by to view live tile mockups & sanitary displays!`;
  } else {
    reply = `Hello! I am your AI Design & Tile Advisor for **M R Tiles & Sanitation**.\n\n` +
      `I can help you with:\n` +
      `1. **Calculating tiles & box counts** for your room size (e.g. type *"Calculate cost for 12x15 room"*)\n` +
      `2. **Recommending tile finishes** for bathrooms, living rooms, and kitchens\n` +
      `3. **Checking stock availability & pricing** for our items\n\n` +
      `How can I assist your project today?`;
    suggestedProducts = products.slice(0, 2);
  }

  res.json({
    success: true,
    reply,
    suggestedProducts
  });
});

// SPA Catch-all Fallback
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/images')) return next();
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.send('M R Tiles & Sanitation API Server Running. Please run `npm run build` for frontend client.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`M R Tiles & Sanitation API server running on http://localhost:${PORT}`);
});
