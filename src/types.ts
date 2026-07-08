export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // 0 means Free
  category: string;
  tags: string[];
  fileFormat: string; // e.g. ".blend", ".fbx"
  polyCount: string; // e.g. "42k Verts", "N/A"
  license: string; // e.g. "Royalty Free", "CC-BY"
  published: boolean;
  downloadsCount: number;
  salesCount: number;
  revenue: number;
  isFeatured: boolean;
  placeholders: string[]; // List of placeholder tags like ['[cyberpunk-main]', '[cyberpunk-detail-1]']
  createdAt: string;
}

export interface Order {
  id: string;
  email: string;
  productId: string;
  productTitle: string;
  pricePaid: number;
  discountCodeUsed?: string;
  status: 'completed' | 'pending';
  downloadToken: string;
  createdAt: string;
}

export interface DiscountCode {
  id: string;
  code: string; // uppercase
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  productId: string; // "all" or specific productId
  active: boolean;
}

export interface DashboardStats {
  totalRevenue: number;
  totalSalesCount: number;
  totalDownloadsCount: number;
  salesHistory: { date: string; amount: number; sales: number }[];
  categorySales: { category: string; sales: number; revenue: number }[];
}
