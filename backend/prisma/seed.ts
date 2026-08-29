import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create Super Admin
  const adminEmail = 'okitr52@gmail.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        id: randomUUID(),
        email: adminEmail,
        name: 'Super Admin',
        role: 'SUPER_ADMIN'
      }
    });
    console.log(`- Created Super Admin: ${adminEmail}`);
  } else if (existingAdmin.role !== 'SUPER_ADMIN') {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'SUPER_ADMIN' }
    });
    console.log(`- Updated Super Admin role for: ${adminEmail}`);
  }

  // Create Client
  const client = await prisma.client.create({
    data: {
      name: 'PT. Maju Mundur',
      contact: '081234567890'
    }
  });

  // Create Project
  const project = await prisma.project.create({
    data: {
      name: 'Instalasi Jaringan Gedung A',
      clientId: client.id,
      totalCapital: 15000000,
      status: 'Aktif'
    }
  });

  // Create Products
  const p1 = await prisma.product.create({
    data: {
      name: 'Kabel UTP Cat 6',
      category: 'Kabel',
      stock: 15,
      unit: 'Roll'
    }
  });

  const p2 = await prisma.product.create({
    data: {
      name: 'Router Mikrotik RB750',
      category: 'Networking',
      stock: 2,
      unit: 'Pcs',
      status: 'Kritis'
    }
  });

  console.log('✅ Seeding completed.');
  console.log(`- Klien ID: ${client.id}`);
  console.log(`- Proyek ID: ${project.id}`);
  console.log(`- Produk 1 ID: ${p1.id}`);
  console.log(`- Produk 2 ID: ${p2.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
