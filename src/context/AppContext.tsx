import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, StockTransaction, InventoryStats, UserProfile, UnitType } from '../types/inventory.ts';
import { soundAndHaptics } from '../utils/soundAndHaptics.ts';

interface MovementConfig {
  isOpen: boolean;
  product: Product | null;
  type: 'IN' | 'OUT';
  defaultLocation: 'godam' | 'dukan';
}

interface AppContextType {
  products: Product[];
  stats: InventoryStats | null;
  transactions: StockTransaction[];
  currentUser: UserProfile;
  users: UserProfile[];
  activeTab: 'dashboard' | 'godam' | 'dukan' | 'transfer' | 'history';
  setActiveTab: (tab: 'dashboard' | 'godam' | 'dukan' | 'transfer' | 'history') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  lang: 'hi' | 'en';
  toggleLang: () => void;
  t: (hiText: string, enText: string) => string;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  movementModalConfig: MovementConfig;
  openMovementModal: (product: Product, type: 'IN' | 'OUT', defaultLocation?: 'godam' | 'dukan') => void;
  closeMovementModal: () => void;
  transferTargetProduct: Product | null;
  setTransferTargetProduct: (p: Product | null) => void;
  isUserSwitchOpen: boolean;
  setIsUserSwitchOpen: (open: boolean) => void;
  switchUser: (user: UserProfile) => void;
  isCloudSynced: boolean;
  lastSyncTime: string;
  isLoading: boolean;
  transferStock: (productId: string, quantity: number, from: 'godam' | 'dukan', to: 'godam' | 'dukan', note?: string) => Promise<boolean>;
  recordStockMovement: (productId: string, type: 'IN' | 'OUT', quantity: number, location: 'godam' | 'dukan', reason: string, note?: string) => Promise<boolean>;
  quickSellDukan: (productId: string, quantity: number) => Promise<boolean>;
  addNewProduct: (product: {
    name: string;
    brand: string;
    modelSize: string;
    category: string;
    unit: UnitType;
    purchasePrice: number;
    sellingPrice: number;
    godamStock: number;
    dukanStock: number;
    minStockAlert: number;
  }) => Promise<boolean>;
  editProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  removeProduct: (id: string) => Promise<boolean>;
  fetchFreshData: () => Promise<void>;
  categories: string[];
  brands: string[];
}

const defaultOwner: UserProfile = {
  id: 'user_owner',
  name: 'राजेश शर्मा (मालिक)',
  role: 'owner',
  phone: '9811002233',
  pin: '1234',
  avatarColor: 'bg-emerald-600',
  locationScope: 'all',
};

// Electrical Hardware Default Seed Products across 4 Core Categories
const DEFAULT_ELECTRICAL_PRODUCTS: Product[] = [
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

const DEFAULT_TRANSACTIONS: StockTransaction[] = [
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

function computeDefaultStats(prods: Product[]): InventoryStats {
  let totalGodamUnits = 0;
  let totalDukanUnits = 0;
  let totalPurchaseValuation = 0;
  let totalSellingValuation = 0;
  let lowStockItemsCount = 0;
  let outOfStockItemsCount = 0;

  for (const p of prods) {
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

  return {
    totalProducts: prods.length,
    totalGodamUnits,
    totalDukanUnits,
    totalUnits: totalGodamUnits + totalDukanUnits,
    totalPurchaseValuation,
    totalSellingValuation,
    lowStockItemsCount,
    outOfStockItemsCount,
    todayTransactionsCount: 3,
    lastUpdated: new Date().toISOString(),
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(DEFAULT_ELECTRICAL_PRODUCTS);
  const [stats, setStats] = useState<InventoryStats | null>(() => computeDefaultStats(DEFAULT_ELECTRICAL_PRODUCTS));
  const [transactions, setTransactions] = useState<StockTransaction[]>(DEFAULT_TRANSACTIONS);
  const [users, setUsers] = useState<UserProfile[]>([defaultOwner]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('stockdukan_current_user');
      return saved ? JSON.parse(saved) : defaultOwner;
    } catch {
      return defaultOwner;
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'godam' | 'dukan' | 'transfer' | 'history'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('अभी');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transferTargetProduct, setTransferTargetProduct] = useState<Product | null>(null);
  const [isUserSwitchOpen, setIsUserSwitchOpen] = useState(false);
  const [movementModalConfig, setMovementModalConfig] = useState<MovementConfig>({
    isOpen: false,
    product: null,
    type: 'IN',
    defaultLocation: 'godam',
  });

  const t = useCallback((hiText: string, enText: string) => {
    return lang === 'hi' ? hiText : enText;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => (prev === 'hi' ? 'en' : 'hi'));
    soundAndHaptics.playTap();
  }, []);

  const switchUser = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('stockdukan_current_user', JSON.stringify(user));
    } catch {
      // Ignore
    }
    soundAndHaptics.playSuccess();
  }, []);

  const fetchFreshData = useCallback(async () => {
    try {
      const [invRes, statsRes, txRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/stats'),
        fetch('/api/transactions?limit=100'),
      ]);

      if (invRes.ok) {
        const invData = await invRes.json();
        if (invData.products && invData.products.length > 0) {
          setProducts(invData.products);
        }
        if (invData.users && invData.users.length > 0) {
          setUsers(invData.users);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData && txData.length > 0) {
          setTransactions(txData);
        }
      }

      setIsCloudSynced(true);
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Fetch error:', err);
      setIsCloudSynced(false);
    }
  }, []);

  // Connect to SSE for instant multi-device live syncing
  useEffect(() => {
    fetchFreshData();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'STOCK_CHANGED' || payload.type === 'PRODUCT_ADDED' || payload.type === 'PRODUCT_UPDATED' || payload.type === 'PRODUCT_DELETED') {
            fetchFreshData();
          }
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };

      eventSource.onerror = () => {
        setIsCloudSynced(false);
      };

      eventSource.onopen = () => {
        setIsCloudSynced(true);
      };
    } catch (err) {
      console.warn('SSE not supported or failed to connect:', err);
    }

    const interval = setInterval(fetchFreshData, 8000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [fetchFreshData]);

  // Derived 4 core categories & brands
  const categories = [
    'Switches (स्विच)',
    'Sockets (सॉकेट)',
    'Electrical pipes (इलेक्ट्रिकल पाइप)',
    'Electrical accessories (इलेक्ट्रिकल एक्सेसरीज)',
  ];

  const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean);

  // Transfer stock Godam <-> Dukan
  const transferStock = async (
    productId: string,
    quantity: number,
    from: 'godam' | 'dukan',
    to: 'godam' | 'dukan',
    note?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          type: 'TRANSFER',
          quantity,
          fromLocation: from,
          toLocation: to,
          reason: from === 'godam' ? 'गोदाम से दुकान भेजा गया' : 'दुकान से गोदाम वापसी',
          note,
          user: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'ट्रांसफर विफल रहा');
      }

      soundAndHaptics.playSuccess();
      await fetchFreshData();
      return true;
    } catch (err) {
      soundAndHaptics.playWarning();
      throw err;
    }
  };

  // Record Stock In or Out
  const recordStockMovement = async (
    productId: string,
    type: 'IN' | 'OUT',
    quantity: number,
    location: 'godam' | 'dukan',
    reason: string,
    note?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          type,
          quantity,
          location,
          reason: reason || (type === 'IN' ? 'कंपनी फैक्ट्री माल आया' : 'इलेक्ट्रीशियन / काउंटर बिक्री'),
          note,
          user: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'कार्रवाई विफल रही');
      }

      soundAndHaptics.playSuccess();
      await fetchFreshData();
      return true;
    } catch (err) {
      soundAndHaptics.playWarning();
      throw err;
    }
  };

  // Quick Sell from Dukan Counter
  const quickSellDukan = async (productId: string, quantity: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          type: 'OUT',
          quantity,
          location: 'dukan',
          reason: 'दुकान काउंटर बिक्री (Quick Sale)',
          user: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'बिक्री दर्ज नहीं हो सकी');
      }

      soundAndHaptics.playTap();
      await fetchFreshData();
      return true;
    } catch (err) {
      soundAndHaptics.playWarning();
      throw err;
    }
  };

  // Add new product
  const addNewProduct = async (productData: {
    name: string;
    brand: string;
    modelSize: string;
    category: string;
    unit: UnitType;
    purchasePrice: number;
    sellingPrice: number;
    godamStock: number;
    dukanStock: number;
    minStockAlert: number;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productData,
          userName: currentUser.name,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'उत्पाद नहीं जोड़ा जा सका');
      }

      soundAndHaptics.playSuccess();
      await fetchFreshData();
      return true;
    } catch (err) {
      soundAndHaptics.playWarning();
      throw err;
    }
  };

  // Edit product
  const editProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          userName: currentUser.name,
        }),
      });

      if (!res.ok) {
        throw new Error('अपडेट नहीं हो सका');
      }

      soundAndHaptics.playSuccess();
      await fetchFreshData();
      return true;
    } catch (err) {
      soundAndHaptics.playWarning();
      throw err;
    }
  };

  // Remove product
  const removeProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('हटाया नहीं जा सका');
      }

      soundAndHaptics.playTap();
      await fetchFreshData();
      return true;
    } catch (err) {
      soundAndHaptics.playWarning();
      throw err;
    }
  };

  const openMovementModal = (product: Product, type: 'IN' | 'OUT', defaultLocation: 'godam' | 'dukan' = 'godam') => {
    setMovementModalConfig({
      isOpen: true,
      product,
      type,
      defaultLocation,
    });
    soundAndHaptics.playTap();
  };

  const closeMovementModal = () => {
    setMovementModalConfig(prev => ({ ...prev, isOpen: false, product: null }));
  };

  return (
    <AppContext.Provider
      value={{
        products,
        stats,
        transactions,
        currentUser,
        users,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        lang,
        toggleLang,
        t,
        isAddModalOpen,
        setIsAddModalOpen,
        movementModalConfig,
        openMovementModal,
        closeMovementModal,
        transferTargetProduct,
        setTransferTargetProduct,
        isUserSwitchOpen,
        setIsUserSwitchOpen,
        switchUser,
        isCloudSynced,
        lastSyncTime,
        isLoading,
        transferStock,
        recordStockMovement,
        quickSellDukan,
        addNewProduct,
        editProduct,
        removeProduct,
        fetchFreshData,
        categories,
        brands,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
