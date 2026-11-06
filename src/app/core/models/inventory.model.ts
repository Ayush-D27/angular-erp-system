export interface Product {
  id: string;
  productId: string; // e.g. PRD-1001
  productName: string;
  category: string;
  description: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  supplierId?: string;
  supplierName: string;
  unitOfMeasure?: string; // e.g. Units, Kg, Box, Pcs
  lastUpdated?: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  previousQuantity: number;
  newQuantity: number;
  difference: number;
  reason: string;
  adjustedBy: string;
  date: string;
}
