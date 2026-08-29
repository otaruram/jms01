import { prisma } from '../config/database';

export class DashboardService {
  /**
   * Lightweight aggregation endpoint.
   * Uses Prisma count/sum — no SELECT * or full table scans.
   */
  async getStats() {
    const [
      totalProducts,
      totalProjects,
      totalOrders,
      revenueAgg,
      activeProjects,
      lowStockProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.project.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'PAID' },
      }),
      prisma.project.count({ where: { status: 'Aktif' } }),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
    ]);

    // For the chart: revenue over the last 6 months
    // In a real database, we'd use GROUP BY date. Since we're using Prisma with basic aggregate, 
    // we'll fetch paid orders from the last 6 months and group them in memory (since total orders is usually small enough for an MVP, or we'd use raw SQL).
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of that month

    const recentOrders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: sixMonthsAgo }
      },
      select: { total: true, createdAt: true }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartDataMap = new Map();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      chartDataMap.set(key, 0);
    }

    recentOrders.forEach(order => {
      const key = `${monthNames[order.createdAt.getMonth()]} ${order.createdAt.getFullYear().toString().substring(2)}`;
      if (chartDataMap.has(key)) {
        chartDataMap.set(key, chartDataMap.get(key) + order.total);
      }
    });

    const chartData = Array.from(chartDataMap).map(([name, revenue]) => ({ name, revenue }));

    return {
      totalProducts,
      totalProjects,
      totalOrders,
      totalRevenue: revenueAgg._sum.total || 0,
      activeProjects,
      lowStockProducts,
      chartData
    };
  }
}
