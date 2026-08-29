import { SphRepository, BastRepository } from '../repositories/sph-bast.repository';

const sphRepository = new SphRepository();
const bastRepository = new BastRepository();

export class SphService {
  async getAll(skip: number, take: number) {
    return await sphRepository.findAll(skip, take);
  }

  async create(clientId: string, projectId: string, subject: string, totalAmount: number, items: string) {
    return await sphRepository.create({ clientId, projectId, subject, totalAmount, items });
  }
}

export class BastService {
  async getAll(skip: number, take: number) {
    return await bastRepository.findAll(skip, take);
  }

  async create(clientId: string, projectId: string, description: string) {
    return await bastRepository.create({ clientId, projectId, description });
  }
}
