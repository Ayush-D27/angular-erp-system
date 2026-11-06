export interface Supplier {
  id: string;
  supplierId: string; // e.g. SUP-1001
  supplierName: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  suppliedProducts: string[]; // List of product names or categories
  taxNumber?: string;
  paymentTerms?: string;
  createdAt?: string;
}
