export type UnitType =
  | 'पीस (Pcs)'
  | 'पैकेट (Pkt)'
  | 'बॉक्स (Box)'
  | 'लेंथ / पाइप (Length)'
  | 'बंडल (Bundle)'
  | 'मीटर (Meter)'
  | 'दर्जन (Dzn)'
  | 'सेट (Set)';

export type UserRole = 'owner' | 'staff';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  pin: string;
  avatarColor: string;
  locationScope?: 'all' | 'godam' | 'dukan';
}

export interface Product {
  id: string;
  name: string;
  brand: string;        // e.g., Anchor, Havells, GM, Legrand, Polycab, Precision
  modelSize: string;    // e.g., 6A, 16A, 20mm (Heavy), 25mm, 8-Module, 1.5 sq mm
  category: string;     // e.g., स्विच, सॉकेट, इलेक्ट्रिकल पाइप, पाइप एक्सेसरीज
  unit: UnitType;
  purchasePrice: number; // खरीद भाव
  sellingPrice: number;  // बिक्री भाव
  godamStock: number;    // गोदाम क्वांटिटी
  dukanStock: number;    // दुकान क्वांटिटी
  minStockAlert: number; // Minimum-stock level
  barcode?: string;
  lastUpdated: string;
  updatedBy: string;
}

export type TransactionType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
export type LocationType = 'godam' | 'dukan';

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  brand?: string;
  modelSize?: string;
  unit: UnitType;
  type: TransactionType;
  quantity: number;
  fromLocation?: LocationType;
  toLocation?: LocationType;
  location?: LocationType;
  performedBy: {
    id: string;
    name: string;
    role: UserRole;
  };
  reason: string;
  timestamp: string;
  previousGodamStock: number;
  newGodamStock: number;
  previousDukanStock: number;
  newDukanStock: number;
  note?: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalGodamUnits: number;
  totalDukanUnits: number;
  totalUnits: number;
  totalPurchaseValuation: number;
  totalSellingValuation: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  todayTransactionsCount: number;
  lastUpdated: string;
}
