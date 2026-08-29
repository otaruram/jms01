import { DocumentRepository } from '../repositories/document.repository';

const documentRepository = new DocumentRepository();

export class DocumentService {
  async createSmartDocument(clientId: string, projectId: string, amount: number, itemsJson: string) {
    return await documentRepository.createSmartDocument(clientId, projectId, amount, itemsJson);
  }

  async getAll() {
    return await documentRepository.getAll();
  }
}
