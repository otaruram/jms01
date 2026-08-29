import { OrderRepository } from '../repositories/order.repository';
import { VALID_TRANSITIONS, OrderStatus } from '../validators/order.validator';

const orderRepository = new OrderRepository();

export class OrderService {
  async getAllOrders(skip: number, take: number) {
    return await orderRepository.findAll(skip, take);
  }

  async createOrder(clientId: string, total: number) {
    return await orderRepository.create(clientId, total);
  }

  /**
   * State Machine: Only allows valid transitions.
   * UNPAID → PROCESS → PAID (terminal)
   */
  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Pesanan tidak ditemukan.');
    }

    const currentStatus = order.status as OrderStatus;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];

    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Transisi status tidak valid: "${currentStatus}" → "${newStatus}". ` +
        `Status "${currentStatus}" hanya bisa diubah ke: [${allowedTransitions?.join(', ') || 'tidak ada'}].`
      );
    }

    return await orderRepository.updateStatus(orderId, newStatus);
  }

  async deleteOrder(id: string) {
    return await orderRepository.delete(id);
  }
}
