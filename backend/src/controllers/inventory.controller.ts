import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { parsePagination, paginatedResponse } from '../utils/pagination';

const inventoryService = new InventoryService();

export class InventoryController {
  getInventory = async (req: Request, res: Response) => {
    try {
      const { skip, take, page, limit } = parsePagination(req.query);
      const { data, total } = await inventoryService.getAllProducts(skip, take);
      res.json(paginatedResponse(data, total, page, limit));
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  installProduct = async (req: Request, res: Response) => {
    try {
      // Body already validated by Zod middleware
      const { productId, projectId, qty } = req.body;
      const result = await inventoryService.installProduct(productId, projectId, qty);
      res.status(201).json({ success: true, data: result, message: 'Barang berhasil dipasang dan stok dipotong.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await inventoryService.deleteProduct(id);
      res.json({ success: true, message: 'Barang berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
