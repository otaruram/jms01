import { ProjectRepository } from '../repositories/project.repository';

const projectRepository = new ProjectRepository();

export class ProjectService {
  async getAllProjects(skip: number, take: number) {
    return await projectRepository.findAll(skip, take);
  }

  async getProjectDetails(id: string) {
    return await projectRepository.findById(id);
  }

  async addCapital(projectId: string, type: string, amount: number, description: string) {
    return await projectRepository.addCapital(projectId, type, amount, description);
  }
}
