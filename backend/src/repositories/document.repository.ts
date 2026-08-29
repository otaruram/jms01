import { prisma } from '../config/database';

export class DocumentRepository {
  // Atomic transaction: create DocumentMaster + Kwitansi + SuratJalan in one go (ACID)
  async createSmartDocument(clientId: string, projectId: string, amount: number, itemsJson: string) {
    return await prisma.$transaction(async (tx) => {
      const documentMaster = await tx.documentMaster.create({
        data: { clientId, projectId, amount, itemsJson }
      });

      await tx.kwitansi.create({
        data: { documentMasterId: documentMaster.id }
      });

      await tx.suratJalan.create({
        data: { documentMasterId: documentMaster.id }
      });

      return await tx.documentMaster.findUnique({
        where: { id: documentMaster.id },
        select: {
          id: true,
          clientId: true,
          projectId: true,
          amount: true,
          createdAt: true,
          itemsJson: true,
          kwitansi: { select: { id: true } },
          suratJalan: { select: { id: true } },
        },
      });
    });
  }

  async getAll() {
    return await prisma.documentMaster.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clientId: true,
        projectId: true,
        amount: true,
        createdAt: true,
        itemsJson: true,
        kwitansi: { select: { id: true } },
        suratJalan: { select: { id: true } },
      },
    });
  }
}
