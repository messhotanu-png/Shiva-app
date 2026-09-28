import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'inventory_db.json');

app.use(express.json());

// Multi-client Server-Sent Events (SSE) connections for live phone syncing
const sseClients: Response[] = [];

function broadcastUpdate(type: string, data: unknown) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Initial Electrical Hardware Staff & Owner Profiles
const initialUsers = [
  {
    id: 'user_owner',
    name: 'राजेश शर्मा (मालिक)',
    role: 'owner',
    phone: '9811002233',
    pin: '1234',
    avatarColor: 'bg-emerald-600',
    locationScope: 'all',
  },
  {
    id: 'user_staff_1',
    name: 'मनोज कुमार (दुकान काउंटर)',
    role: 'staff',
    phone: '9822334455',
    pin: '1111',
    avatarColor: 'bg-blue-600',
    locationScope: 'dukan',
  },
  {
    id: 'user_staff_2',
    name: 'सोनू वर्मा (गोदाम इंचार्ज)',
    role: 'staff',
    phone: '9833445566',
    pin: '2222',
    avatarColor: 'bg-amber-600',
    locationScope: 'godam',
  },
];

// 4 Focused Categories:
// 1. Switches (स्विच)
// 2. Sockets (सॉकेट)
// 3. Electrical pipes (इलेक्ट्रिकल पाइप)
// 4. Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)
export const initialElectricalProducts = [
  // 1. SWITCHES
  {
    id: 'prod_sw_1',
    name: '1-Way मॉड्यूलर स्विच (1-Way Modular Switch)',
    brand: 'Anchor Roma',
    modelSize: '6A (1-Module)',
    category: 'Switches (स्विच)',
    unit: 'पीस (Pcs)',
    purchasePrice: 22,
    sellingPrice: 35,
    godamStock: 400,
    dukanStock: 60,
    minStockAlert: 50,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'राजेश शर्मा (मालिक)',
  },
  {
    id: 'prod_sw_2',
    name: 'हैवी पावर स्विच (Heavy Power Switch)',
    brand: 'Havells Fabio',
    modelSize: '16A (1-Module)',
    category: 'Switches (स्विच)',
    unit: 'पीस (Pcs)',
    purchasePrice: 58,
    sellingPrice: 85,
    godamStock: 220,
    dukanStock: 25,
    minStockAlert: 30, // LOW STOCK
    lastUpdated: new Date().toISOString(),
    updatedBy: 'सोनू वर्मा (गोदाम इंचार्ज)',
  },
  {
    id: 'prod_sw_3',
    name: '2-Way सीढ़ी/बेड स्विच (2-Way Staircase Switch)',
    brand: 'GM Modular',
    modelSize: '6A (1-Module)',
    category: 'Switches (स्विच)',
    unit: 'पीस (Pcs)',
    purchasePrice: 38,
    sellingPrice: 55,
    godamStock: 110,
    dukanStock: 8, // LOW STOCK
    minStockAlert: 15,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'मनोज कुमार (दुकान काउंटर)',
  },
  {
    id: 'prod_sw_4',
    name: 'बेल पुश स्विच इंडिकेटर सहित (Bell Push Switch)',
    brand: 'Schneider Electric',
    modelSize: '6A (1-Module with Neon)',
    category: 'Switches (स्विच)',
    unit: 'पीस (Pcs)',
    purchasePrice: 65,
    sellingPrice: 95,
    godamStock: 75,
    dukanStock: 12,
    minStockAlert: 10,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'मनोज कुमार (दुकान काउंटर)',
  },
  {
    id: 'prod_sw_5',
    name: 'आर्टिओर 1-Way स्विच (Arteor Modular Switch)',
    brand: 'Legrand Arteor',
    modelSize: '16A (1-Module White)',
    category: 'Switches (स्विच)',
    unit: 'पीस (Pcs)',
    purchasePrice: 115,
    sellingPrice: 160,
    godamStock: 90,
    dukanStock: 14, // LOW STOCK
    minStockAlert: 20,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'सोनू वर्मा (गोदाम इंचार्ज)',
  },

  // 2. SOCKETS
  {
    id: 'prod_so_1',
    name: '3-पिन यूनिवर्सल शटर सॉकेट (3-Pin Shutter Socket)',
    brand: 'Anchor Roma',
    modelSize: '6A (2-Module)',
    category: 'Sockets (सॉकेट)',
    unit: 'पीस (Pcs)',
    purchasePrice: 48,
    sellingPrice: 72,
    godamStock: 300,
    dukanStock: 35, // LOW STOCK
    minStockAlert: 40,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'राजेश शर्मा (मालिक)',
  },
  {
    id: 'prod_so_2',
    name: 'कंबाइंड ट्विन पावर सॉकेट (Twin Power Socket 6/16A)',
    brand: 'Havells Coral',
    modelSize: '6A/16A (2-Module)',
    category: 'Sockets (सॉकेट)',
    unit: 'पीस (Pcs)',
    purchasePrice: 92,
    sellingPrice: 135,
    godamStock: 180,
    dukanStock: 18, // LOW STOCK
    minStockAlert: 25,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'मनोज कुमार (दुकान काउंटर)',
  },
  {
    id: 'prod_so_3',
    name: 'हैवी ड्यूटी AC / गीजर सॉकेट बॉक्स (AC Starter Socket)',
    brand: 'Legrand Arteor',
    modelSize: '25A (Heavy Duty)',
    category: 'Sockets (सॉकेट)',
    unit: 'पीस (Pcs)',
    purchasePrice: 195,
    sellingPrice: 280,
    godamStock: 60,
    dukanStock: 6, // LOW STOCK
    minStockAlert: 10,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'सोनू वर्मा (गोदाम इंचार्ज)',
  },
  {
    id: 'prod_so_4',
    name: 'मल्टी-पिन इंटरनेशनल सॉकेट (Multi-Pin Socket)',
    brand: 'GM Modular',
    modelSize: '6A/13A/16A (2-Module)',
    category: 'Sockets (सॉकेट)',
    unit: 'पीस (Pcs)',
    purchasePrice: 110,
    sellingPrice: 155,
    godamStock: 85,
    dukanStock: 10, // LOW STOCK
    minStockAlert: 15,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'मनोज कुमार (दुकान काउंटर)',
  },
  {
    id: 'prod_so_5',
    name: 'यूरो 2-पिन डबल सॉकेट (Euro 2-Pin Socket)',
    brand: 'Goldmedal Curve',
    modelSize: '6A (1-Module)',
    category: 'Sockets (सॉकेट)',
    unit: 'पीस (Pcs)',
    purchasePrice: 35,
    sellingPrice: 50,
    godamStock: 140,
    dukanStock: 22,
    minStockAlert: 20,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'राजेश शर्मा (मालिक)',
  },

  // 3. ELECTRICAL PIPES
  {
    id: 'prod_pipe_1',
    name: 'PVC कंड्यूट पाइप हैवी 3m (PVC Conduit Pipe Heavy)',
    brand: 'Precision',
    modelSize: '20mm (Heavy - 3m Length)',
    category: 'Electrical pipes (इलेक्ट्रिकल पाइप)',
    unit: 'लेंथ / पाइप (Length)',
    purchasePrice: 48,
    sellingPrice: 68,
    godamStock: 800,
    dukanStock: 45, // LOW STOCK
    minStockAlert: 60,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'सोनू वर्मा (गोदाम इंचार्ज)',
  },
  {
    id: 'prod_pipe_2',
    name: 'PVC कंड्यूट पाइप मीडियम 3m (PVC Conduit Pipe Medium)',
    brand: 'Precision',
    modelSize: '25mm (Medium - 3m Length)',
    category: 'Electrical pipes (इलेक्ट्रिकल पाइप)',
    unit: 'लेंथ / पाइप (Length)',
    purchasePrice: 65,
    sellingPrice: 90,
    godamStock: 500,
    dukanStock: 30, // LOW STOCK
    minStockAlert: 40,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'सोनू वर्मा (गोदाम इंचार्ज)',
  },
  {
    id: 'prod_pipe_3',
    name: 'सुपर रिजिड PVC पाइप (Super Rigid Conduit Pipe)',
    brand: 'Sudhakar',
    modelSize: '20mm (Heavy Duty - 3m)',
    category: 'Electrical pipes (इलेक्ट्रिकल पाइप)',
    unit: 'लेंथ / पाइप (Length)',
    purchasePrice: 52,
    sellingPrice: 74,
    godamStock: 450,
    dukanStock: 35, // LOW STOCK
    minStockAlert: 40,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'सोनू वर्मा (गोदाम इंचार्ज)',
  },
  {
    id: 'prod_pipe_4',
    name: 'फ्लेक्सिबल स्प्रिंग पाइप बंडल (Corrugated Flexible Pipe)',
    brand: 'Goldmedal',
    modelSize: '20mm (50m Bundle)',
    category: 'Electrical pipes (इलेक्ट्रिकल पाइप)',
    unit: 'बंडल (Bundle)',
    purchasePrice: 290,
    sellingPrice: 385,
    godamStock: 45,
    dukanStock: 5, // LOW STOCK
    minStockAlert: 10,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'मनोज कुमार (दुकान काउंटर)',
  },
  {
    id: 'prod_pipe_5',
    name: 'हैवी PVC कंड्यूट पाइप (Heavy Conduit Pipe)',
    brand: 'Finolex',
    modelSize: '25mm (Heavy - 3m Length)',
    category: 'Electrical pipes (इलेक्ट्रिकल पाइप)',
    unit: 'लेंथ / पाइप (Length)',
    purchasePrice: 72,
    sellingPrice: 98,
    godamStock: 320,
    dukanStock: 20, // LOW STOCK
    minStockAlert: 25,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'सोनू वर्मा (गोदाम इंचार्ज)',
  },

  // 4. ELECTRICAL ACCESSORIES
  {
    id: 'prod_acc_1',
    name: 'PVC लॉन्ग बेंड 20mm (PVC Long Bend Heavy)',
    brand: 'Precision',
    modelSize: '20mm (Heavy - Pack of 25)',
    category: 'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
    unit: 'पैकेट (Pkt)',
    purchasePrice: 120,
    sellingPrice: 175,
    godamStock: 95,
    dukanStock: 12, // LOW STOCK
    minStockAlert: 20,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'सोनू वर्मा (गोदाम इंचार्ज)',
  },
  {
    id: 'prod_acc_2',
    name: '4-Way डीप जंक्शन बॉक्स (4-Way Deep Junction Box)',
    brand: 'Precision',
    modelSize: '20mm Deep (with Lid)',
    category: 'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
    unit: 'पीस (Pcs)',
    purchasePrice: 14,
    sellingPrice: 24,
    godamStock: 600,
    dukanStock: 65, // LOW STOCK
    minStockAlert: 70,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'राजेश शर्मा (मालिक)',
  },
  {
    id: 'prod_acc_3',
    name: 'हैवी ऑक्टागोनल फैन बॉक्स रॉड सहित (Fan Box with Hook Rod)',
    brand: 'VIP Heavy Steel',
    modelSize: '12mm Hook Rod (Linter Fit)',
    category: 'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
    unit: 'पीस (Pcs)',
    purchasePrice: 68,
    sellingPrice: 98,
    godamStock: 150,
    dukanStock: 15, // LOW STOCK
    minStockAlert: 25,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'सोनू वर्मा (गोदाम इंचार्ज)',
  },
  {
    id: 'prod_acc_4',
    name: 'PVC पाइप कपलर सॉकेट (PVC Pipe Coupler)',
    brand: 'Sudhakar',
    modelSize: '20mm (Pack of 50)',
    category: 'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
    unit: 'पैकेट (Pkt)',
    purchasePrice: 95,
    sellingPrice: 140,
    godamStock: 70,
    dukanStock: 8, // LOW STOCK
    minStockAlert: 15,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'मनोज कुमार (दुकान काउंटर)',
  },
  {
    id: 'prod_acc_5',
    name: 'कंसील्ड मेटल बॉक्स (Concealed GI Metal Box 8M)',
    brand: 'Anchor Roma',
    modelSize: '8-Module (Horizontal)',
    category: 'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
    unit: 'पीस (Pcs)',
    purchasePrice: 62,
    sellingPrice: 90,
    godamStock: 200,
    dukanStock: 20, // LOW STOCK
    minStockAlert: 30,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'सोनू वर्मा (गोदाम इंचार्ज)',
  },
  {
    id: 'prod_acc_6',
    name: 'कंसील्ड मेटल बॉक्स (Concealed GI Metal Box 12M)',
    brand: 'Anchor Roma',
    modelSize: '12-Module (Double Grid)',
    category: 'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
    unit: 'पीस (Pcs)',
    purchasePrice: 85,
    sellingPrice: 125,
    godamStock: 120,
    dukanStock: 10, // LOW STOCK
    minStockAlert: 15,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'राजेश शर्मा (मालिक)',
  },
  {
    id: 'prod_acc_7',
    name: 'स्कर्ट फैंसी एंगल लैंप होल्डर (Angle Lamp Holder)',
    brand: 'Anchor',
    modelSize: 'Heavy Brass Ring B22',
    category: 'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
    unit: 'पीस (Pcs)',
    purchasePrice: 24,
    sellingPrice: 38,
    godamStock: 250,
    dukanStock: 30, // LOW STOCK
    minStockAlert: 40,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'मनोज कुमार (दुकान काउंटर)',
  },
  {
    id: 'prod_acc_8',
    name: 'PVC इंसुलेशन टेप बॉक्स (Electrical Insulation Tape 10P)',
    brand: 'Steelgrip',
    modelSize: '7.5m Pack of 10 Rolls',
    category: 'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
    unit: 'बॉक्स (Box)',
    purchasePrice: 110,
    sellingPrice: 150,
    godamStock: 80,
    dukanStock: 12, // LOW STOCK
    minStockAlert: 15,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'राजेश शर्मा (मालिक)',
  },
];

const initialTransactions = [
  {
    id: 'tx_init_1',
    productId: 'prod_pipe_1',
    productName: 'PVC कंड्यूट पाइप हैवी 3m (PVC Conduit Pipe Heavy)',
    brand: 'Precision',
    modelSize: '20mm (Heavy - 3m Length)',
    unit: 'लेंथ / पाइप (Length)',
    type: 'IN',
    quantity: 800,
    location: 'godam',
    performedBy: { id: 'user_owner', name: 'राजेश शर्मा (मालिक)', role: 'owner' },
    reason: 'कंपनी फैक्ट्री ट्रक डिलीवरी (चालान #EL-9902)',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    previousGodamStock: 0,
    newGodamStock: 800,
    previousDukanStock: 45,
    newDukanStock: 45,
    note: 'सप्लायर: प्रेसिजन पाइप्स प्रा. लि.',
  },
  {
    id: 'tx_init_2',
    productId: 'prod_sw_1',
    productName: '1-Way मॉड्यूलर स्विच (1-Way Modular Switch)',
    brand: 'Anchor Roma',
    modelSize: '6A (1-Module)',
    unit: 'पीस (Pcs)',
    type: 'TRANSFER',
    quantity: 50,
    fromLocation: 'godam',
    toLocation: 'dukan',
    performedBy: { id: 'user_staff_2', name: 'सोनू वर्मा (गोदाम इंचार्ज)', role: 'staff' },
    reason: 'दुकान काउंटर रैक रीस्टॉक',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    previousGodamStock: 450,
    newGodamStock: 400,
    previousDukanStock: 10,
    newDukanStock: 60,
    note: 'स्विच बॉक्स काउंटर ट्रांसफर',
  },
  {
    id: 'tx_init_3',
    productId: 'prod_so_2',
    productName: 'कंबाइंड ट्विन पावर सॉकेट (Twin Power Socket 6/16A)',
    brand: 'Havells Coral',
    modelSize: '6A/16A (2-Module)',
    unit: 'पीस (Pcs)',
    type: 'OUT',
    quantity: 5,
    location: 'dukan',
    performedBy: { id: 'user_staff_1', name: 'मनोज कुमार (दुकान काउंटर)', role: 'staff' },
    reason: 'इलेक्ट्रीशियन ठेकेदार बिक्री (Cash Sale)',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    previousGodamStock: 180,
    newGodamStock: 180,
    previousDukanStock: 23,
    newDukanStock: 18,
    note: 'साइट: शर्मा जी का मकान',
  },
];

interface DBState {
  version: number;
  lastUpdated: string;
  users: typeof initialUsers;
  products: typeof initialElectricalProducts;
  transactions: typeof initialTransactions;
}

function loadDatabase(): DBState {
  // Always initialize fresh electrical products for the 4 core categories
  const defaultDb: DBState = {
    version: 3,
    lastUpdated: new Date().toISOString(),
    users: initialUsers,
    products: initialElectricalProducts,
    transactions: initialTransactions,
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // If valid electrical database version 3, load it
      if (parsed.version === 3 && parsed.products && parsed.products.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading DB:', err);
  }

  saveDatabase(defaultDb);
  return defaultDb;
}

function saveDatabase(db: DBState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// SSE Endpoint for multi-phone real-time inventory updates
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientsCount: sseClients.length + 1 })}\n\n`);
  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// GET /api/inventory
app.get('/api/inventory', (_req: Request, res: Response) => {
  res.json({
    products: db.products,
    users: db.users,
    lastUpdated: db.lastUpdated,
  });
});

// GET /api/stats
app.get('/api/stats', (_req: Request, res: Response) => {
  const products = db.products;
  let totalGodamUnits = 0;
  let totalDukanUnits = 0;
  let totalPurchaseValuation = 0;
  let totalSellingValuation = 0;
  let lowStockItemsCount = 0;
  let outOfStockItemsCount = 0;

  for (const p of products) {
    totalGodamUnits += p.godamStock;
    totalDukanUnits += p.dukanStock;
    const totalItemUnits = p.godamStock + p.dukanStock;
    totalPurchaseValuation += totalItemUnits * (p.purchasePrice || 0);
    totalSellingValuation += totalItemUnits * (p.sellingPrice || 0);

    if (p.dukanStock <= 0) {
      outOfStockItemsCount++;
    } else if (p.dukanStock <= p.minStockAlert) {
      lowStockItemsCount++;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayTransactionsCount = db.transactions.filter(t => t.timestamp.startsWith(today)).length;

  res.json({
    totalProducts: products.length,
    totalGodamUnits,
    totalDukanUnits,
    totalUnits: totalGodamUnits + totalDukanUnits,
    totalPurchaseValuation,
    totalSellingValuation,
    lowStockItemsCount,
    outOfStockItemsCount,
    todayTransactionsCount,
    lastUpdated: db.lastUpdated,
  });
});

// POST /api/products
app.post('/api/products', (req: Request, res: Response) => {
  const { name, brand, modelSize, category, unit, purchasePrice, sellingPrice, godamStock, dukanStock, minStockAlert, userName } = req.body;
  if (!name || !unit) {
    return res.status(400).json({ error: 'उत्पाद का नाम और इकाई आवश्यक है' });
  }

  const newProduct = {
    id: 'prod_el_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    brand: (brand || 'Anchor Roma').trim(),
    modelSize: (modelSize || 'Standard').trim(),
    category: (category || 'Switches (स्विच)').trim(),
    unit,
    purchasePrice: Number(purchasePrice) || 0,
    sellingPrice: Number(sellingPrice) || 0,
    godamStock: Math.max(0, Number(godamStock) || 0),
    dukanStock: Math.max(0, Number(dukanStock) || 0),
    minStockAlert: Math.max(1, Number(minStockAlert) || 10),
    lastUpdated: new Date().toISOString(),
    updatedBy: userName || 'राजेश शर्मा (मालिक)',
  };

  db.products.unshift(newProduct);
  db.lastUpdated = new Date().toISOString();

  // Create initial log
  if (newProduct.godamStock > 0 || newProduct.dukanStock > 0) {
    db.transactions.unshift({
      id: 'tx_' + Date.now(),
      productId: newProduct.id,
      productName: newProduct.name,
      brand: newProduct.brand,
      modelSize: newProduct.modelSize,
      unit: newProduct.unit,
      type: 'IN',
      quantity: newProduct.godamStock + newProduct.dukanStock,
      location: newProduct.godamStock > 0 ? 'godam' : 'dukan',
      performedBy: { id: 'user_active', name: userName || 'राजेश शर्मा (मालिक)', role: 'owner' },
      reason: 'नया इलेक्ट्रिकल सामान स्टॉक में जोड़ा गया',
      timestamp: new Date().toISOString(),
      previousGodamStock: 0,
      newGodamStock: newProduct.godamStock,
      previousDukanStock: 0,
      newDukanStock: newProduct.dukanStock,
      note: `प्रारंभिक स्टॉक: गोदाम ${newProduct.godamStock}, दुकान ${newProduct.dukanStock}`,
    });
  }

  saveDatabase(db);
  broadcastUpdate('PRODUCT_ADDED', { product: newProduct });
  res.status(201).json(newProduct);
});

// PUT /api/products/:id
app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const productIndex = db.products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'सामान नहीं मिला' });
  }

  const existing = db.products[productIndex];
  const { name, brand, modelSize, category, unit, purchasePrice, sellingPrice, minStockAlert, userName } = req.body;

  db.products[productIndex] = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    brand: brand !== undefined ? brand.trim() : existing.brand,
    modelSize: modelSize !== undefined ? modelSize.trim() : existing.modelSize,
    category: category !== undefined ? category.trim() : existing.category,
    unit: unit !== undefined ? unit : existing.unit,
    purchasePrice: purchasePrice !== undefined ? Number(purchasePrice) : existing.purchasePrice,
    sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : existing.sellingPrice,
    minStockAlert: minStockAlert !== undefined ? Number(minStockAlert) : existing.minStockAlert,
    lastUpdated: new Date().toISOString(),
    updatedBy: userName || existing.updatedBy,
  };

  db.lastUpdated = new Date().toISOString();
  saveDatabase(db);
  broadcastUpdate('PRODUCT_UPDATED', { product: db.products[productIndex] });
  res.json(db.products[productIndex]);
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const productIndex = db.products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'सामान नहीं मिला' });
  }

  const removed = db.products.splice(productIndex, 1)[0];
  db.lastUpdated = new Date().toISOString();
  saveDatabase(db);
  broadcastUpdate('PRODUCT_DELETED', { productId: id });
  res.json({ success: true, removed });
});

// POST /api/transactions
app.post('/api/transactions', (req: Request, res: Response) => {
  const { productId, type, quantity, fromLocation, toLocation, location, reason, note, user } = req.body;
  const qty = Number(quantity);

  if (!productId || !type || isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'अमान्य मात्रा या विवरण' });
  }

  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'सामान नहीं मिला' });
  }

  const prevGodam = product.godamStock;
  const prevDukan = product.dukanStock;
  let newGodam = prevGodam;
  let newDukan = prevDukan;

  if (type === 'TRANSFER') {
    const from = fromLocation || 'godam';
    const to = toLocation || 'dukan';

    if (from === 'godam' && to === 'dukan') {
      if (prevGodam < qty) {
        return res.status(400).json({ error: `गोदाम में केवल ${prevGodam} ${product.unit} स्टॉक उपलब्ध है` });
      }
      newGodam = prevGodam - qty;
      newDukan = prevDukan + qty;
    } else if (from === 'dukan' && to === 'godam') {
      if (prevDukan < qty) {
        return res.status(400).json({ error: `दुकान में केवल ${prevDukan} ${product.unit} स्टॉक उपलब्ध है` });
      }
      newDukan = prevDukan - qty;
      newGodam = prevGodam + qty;
    } else {
      return res.status(400).json({ error: 'समान स्थान पर ट्रांसफर संभव नहीं है' });
    }
  } else if (type === 'IN') {
    const targetLoc = location || 'godam';
    if (targetLoc === 'godam') {
      newGodam = prevGodam + qty;
    } else {
      newDukan = prevDukan + qty;
    }
  } else if (type === 'OUT') {
    const targetLoc = location || 'dukan';
    if (targetLoc === 'godam') {
      if (prevGodam < qty) {
        return res.status(400).json({ error: `गोदाम में केवल ${prevGodam} ${product.unit} स्टॉक है` });
      }
      newGodam = prevGodam - qty;
    } else {
      if (prevDukan < qty) {
        return res.status(400).json({ error: `दुकान में केवल ${prevDukan} ${product.unit} स्टॉक है` });
      }
      newDukan = prevDukan - qty;
    }
  } else if (type === 'ADJUSTMENT') {
    const targetLoc = location || 'godam';
    if (targetLoc === 'godam') {
      newGodam = qty;
    } else {
      newDukan = qty;
    }
  } else {
    return res.status(400).json({ error: 'अमान्य कार्रवाई प्रकार' });
  }

  // Update product stock
  product.godamStock = newGodam;
  product.dukanStock = newDukan;
  product.lastUpdated = new Date().toISOString();
  product.updatedBy = user?.name || 'स्टाफ';

  const transaction = {
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    modelSize: product.modelSize,
    unit: product.unit,
    type,
    quantity: qty,
    fromLocation,
    toLocation,
    location,
    performedBy: user || { id: 'unknown', name: 'स्टाफ सदस्य', role: 'staff' },
    reason: reason || (type === 'TRANSFER' ? 'गोदाम से दुकान ट्रांसफर' : type === 'IN' ? 'कंपनी माल आया' : 'इलेक्ट्रीशियन / काउंटर बिक्री'),
    timestamp: new Date().toISOString(),
    previousGodamStock: prevGodam,
    newGodamStock: newGodam,
    previousDukanStock: prevDukan,
    newDukanStock: newDukan,
    note: note || '',
  };

  db.transactions.unshift(transaction);
  if (db.transactions.length > 500) {
    db.transactions.pop();
  }

  db.lastUpdated = new Date().toISOString();
  saveDatabase(db);

  broadcastUpdate('STOCK_CHANGED', { product, transaction });
  res.status(201).json({ success: true, product, transaction });
});

// GET /api/transactions
app.get('/api/transactions', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const productId = req.query.productId as string;
  let list = db.transactions;
  if (productId) {
    list = list.filter(t => t.productId === productId);
  }
  res.json(list.slice(0, limit));
});

// GET /api/users
app.get('/api/users', (_req: Request, res: Response) => {
  res.json(db.users);
});

// POST /api/users
app.post('/api/users', (req: Request, res: Response) => {
  const { name, role, phone, pin, locationScope } = req.body;
  if (!name || !pin) {
    return res.status(400).json({ error: 'नाम और पिन आवश्यक है' });
  }

  const newUser = {
    id: 'user_' + Date.now(),
    name: name.trim(),
    role: (role === 'owner' ? 'owner' : 'staff') as 'owner' | 'staff',
    phone: phone ? phone.trim() : '',
    pin: pin.trim(),
    avatarColor: role === 'owner' ? 'bg-emerald-600' : 'bg-blue-600',
    locationScope: locationScope || (role === 'owner' ? 'all' : 'dukan'),
  };

  db.users.push(newUser);
  saveDatabase(db);
  broadcastUpdate('USERS_UPDATED', { users: db.users });
  res.status(201).json(newUser);
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: db.version,
    lastUpdated: db.lastUpdated,
    productsCount: db.products.length,
    connectedStaffDevices: sseClients.length,
  });
});

// Vite Middleware integration for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StockDukan Electrical Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
