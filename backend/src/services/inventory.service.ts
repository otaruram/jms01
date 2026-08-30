import { InventoryRepository } from '../repositories/inventory.repository';

const inventoryRepository = new InventoryRepository();

export class InventoryService {
  async getAllProducts(skip: number, take: number) {
    return await inventoryRepository.findAll(skip, take);
  }

  async createProduct(data: { name: string; category: string; stock: number; unit: string; status?: string }) {
    return await inventoryRepository.create(data);
  }

  async addStock(id: string, qty: number) {
    return await inventoryRepository.addStock(id, qty);
  }

  async installProduct(productId: string, projectId: string, qty: number) {
    // Business Logic: Check if stock is sufficient
    const product = await inventoryRepository.findById(productId);
    if (!product) {
      throw new Error('Produk tidak ditemukan.');
    }

    if (product.stock < qty) {
      throw new Error(`Stok tidak mencukupi. Sisa stok: ${product.stock}`);
    }

    // Trigger installation and deduct stock (atomic transaction)
    return await inventoryRepository.createInstallationAndDeductStock(productId, projectId, qty);
  }

  async deleteProduct(id: string) {
    return await inventoryRepository.delete(id);
  }
}
