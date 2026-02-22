import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@toursphere.com' },
    update: {},
    create: {
      email: 'admin@toursphere.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create some tours
  const tour1 = await prisma.tour.create({
    data: {
      title: 'The Forest Hiker',
      description: 'Explore the beautiful forest of the Pacific Northwest.',
      price: 497,
      duration: 5,
      location: 'Oregon, USA',
      maxGroupSize: 25,
      difficulty: 'Easy',
      images: 'tour-1-1.jpg,tour-1-2.jpg',
      startDates: '2026-04-25,2026-07-20',
    },
  });

  const tour2 = await prisma.tour.create({
    data: {
      title: 'The Sea Explorer',
      description: 'A beautiful boat trip through the islands of the Caribbean.',
      price: 897,
      duration: 7,
      location: 'Bahamas',
      maxGroupSize: 15,
      difficulty: 'Medium',
      images: 'tour-2-1.jpg,tour-2-2.jpg',
      startDates: '2026-05-15,2026-08-10',
    },
  });

  console.log('Seed completed successfully!');
  console.log({ admin, tour1, tour2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
