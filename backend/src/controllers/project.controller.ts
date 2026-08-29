import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { parsePagination, paginatedResponse } from '../utils/pagination';

const projectService = new ProjectService();

export class ProjectController {
  getAllProjects = async (req: Request, res: Response) => {
    try {
      const { skip, take, page, limit } = parsePagination(req.query);
      const { data, total } = await projectService.getAllProjects(skip, take);
      res.json(paginatedResponse(data, total, page, limit));
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getProjectDetails = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const project = await projectService.getProjectDetails(id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Proyek tidak ditemukan.' });
      }
      res.json({ success: true, data: project });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  addCapital = async (req: Request, res: Response) => {
    try {
      // Body already validated by Zod middleware
      const { projectId, type, amount, description } = req.body;
      const capital = await projectService.addCapital(projectId, type, amount, description);
      res.status(201).json({ success: true, data: capital });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  createProject = async (req: Request, res: Response) => {
    try {
      const { name, clientId, totalCapital } = req.body;
      const project = await projectService.createProject(name, clientId, totalCapital || 0);
      res.status(201).json({ success: true, data: project, message: 'Proyek berhasil dibuat' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
