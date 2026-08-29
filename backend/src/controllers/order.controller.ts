import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { parsePagination, paginatedResponse } from '../utils/pagination';

const orderService = new OrderService();

export class OrderController {
  getAllOrders = async (req: Request, res: Response) => {
    try {
      const { skip, take, page, limit } = parsePagination(req.query);
      const { data, total } = await orderService.getAllOrders(skip, take);
      res.json(paginatedResponse(data, total, page, limit));
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  createOrder = async (req: Request, res: Response) => {
    try {
      const { clientId, total } = req.body;
      const order = await orderService.createOrder(clientId, total);
      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(id, status);
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
