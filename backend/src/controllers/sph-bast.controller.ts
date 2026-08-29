import { Request, Response } from 'express';
import { SphService, BastService } from '../services/sph-bast.service';
import { parsePagination, paginatedResponse } from '../utils/pagination';

const sphService = new SphService();
const bastService = new BastService();

export class SphController {
  getAll = async (req: Request, res: Response) => {
    try {
      const { skip, take, page, limit } = parsePagination(req.query);
      const { data, total } = await sphService.getAll(skip, take);
      res.json(paginatedResponse(data, total, page, limit));
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { clientId, projectId, subject, totalAmount, items } = req.body;
      const sph = await sphService.create(clientId, projectId, subject, totalAmount, items);
      res.status(201).json({ success: true, data: sph });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  deleteSph = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await sphService.delete(id);
      res.json({ success: true, message: 'SPH berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export class BastController {
  getAll = async (req: Request, res: Response) => {
    try {
      const { skip, take, page, limit } = parsePagination(req.query);
      const { data, total } = await bastService.getAll(skip, take);
      res.json(paginatedResponse(data, total, page, limit));
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { clientId, projectId, description } = req.body;
      const bast = await bastService.create(clientId, projectId, description);
      res.status(201).json({ success: true, data: bast });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  deleteBast = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await bastService.delete(id);
      res.json({ success: true, message: 'BAST berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
