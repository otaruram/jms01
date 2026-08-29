import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Mengaktifkan Row Level Security (RLS) pada semua tabel...');

  const tables = [
    'Product',
    'Installation',
    'Client',
    'Project',
    'ProjectCapital',
    'Order',
    'DocumentMaster',
    'Kwitansi',
    'SuratJalan'
  ];

  for (const table of tables) {
    // Quote table names because Prisma creates them with exact casing (e.g. "Product")
    const query = `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`;
    await prisma.$executeRawUnsafe(query);
    console.log(`✅ RLS diaktifkan untuk tabel: ${table}`);
  }

  console.log('Semua tabel telah dilindungi dengan RLS!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
