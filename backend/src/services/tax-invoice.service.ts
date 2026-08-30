import { TaxInvoiceRepository } from '../repositories/tax-invoice.repository';

const taxInvoiceRepository = new TaxInvoiceRepository();

export class TaxInvoiceService {
  async getAllTaxInvoices(skip: number, take: number) {
    return await taxInvoiceRepository.findAll(skip, take);
  }

  async getTaxInvoiceById(id: string) {
    const invoice = await taxInvoiceRepository.findById(id);
    if (!invoice) throw new Error('Faktur Pajak tidak ditemukan');
    return invoice;
  }

  async createTaxInvoice(data: any) {
    // Basic validation to check if client exists can be added here or rely on DB FK
    return await taxInvoiceRepository.create(data);
  }

  async updateTaxInvoice(id: string, data: any) {
    return await taxInvoiceRepository.update(id, data);
  }

  async deleteTaxInvoice(id: string) {
    return await taxInvoiceRepository.delete(id);
  }
}
