import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';

const documentService = new DocumentService();

export class DocumentController {
  createSmartDocument = async (req: Request, res: Response) => {
    try {
      // Body already validated by Zod middleware
      const { clientId, projectId, amount, itemsJson } = req.body;

      const documentMaster = await documentService.createSmartDocument(
        clientId, projectId, amount, itemsJson
      );

      res.status(201).json({ success: true, data: documentMaster });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const documents = await documentService.getAll();
      res.status(200).json({ success: true, data: documents });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  deleteDocument = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await documentService.deleteDocument(id);
      res.json({ success: true, message: 'Dokumen berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
