import { Request, Response } from 'express';
import { TaxInvoiceService } from '../services/tax-invoice.service';
import { parsePagination, paginatedResponse } from '../utils/pagination';

const taxInvoiceService = new TaxInvoiceService();

export class TaxInvoiceController {
  getAll = async (req: Request, res: Response) => {
    try {
      const { skip, take, page, limit } = parsePagination(req.query);
      const { data, total } = await taxInvoiceService.getAllTaxInvoices(skip, take);
      res.json(paginatedResponse(data, total, page, limit));
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const invoice = await taxInvoiceService.createTaxInvoice(data);
      res.status(201).json({ success: true, data: invoice });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({ success: false, message: 'Nomor Faktur sudah digunakan' });
      } else if (error.code === 'P2003') {
        res.status(400).json({ success: false, message: 'ID Klien atau ID Proyek tidak ditemukan di database' });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const invoice = await taxInvoiceService.updateTaxInvoice(id as string, { status });
      res.json({ success: true, data: invoice });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await taxInvoiceService.deleteTaxInvoice(id as string);
      res.json({ success: true, message: 'Faktur Pajak berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
