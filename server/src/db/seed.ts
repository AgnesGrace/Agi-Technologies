import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

dotenv.config();
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const db = new PrismaClient({ adapter });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanDatabase() {
  console.log('Resetting db state safely');

  await db.transaction.deleteMany({});
  await db.progress.deleteMany({});
  await db.enrollment.deleteMany({});
  await db.comment.deleteMany({});
  await db.review.deleteMany({});
  await db.lecture.deleteMany({});
  await db.section.deleteMany({});
  await db.course.deleteMany({});
  await db.user.deleteMany({});

  console.log('Database state safely reset.');
}

async function provisionInitialUsers() {
  console.log('Provisioning system users...');

  const instructor = await db.user.create({
    data: {
      id: 'user_seed_instructor_101',
      email: 'agnesaugustine11@gmail.com',
      name: 'Agnes',
      role: 'ADMIN',
      imageUrl:
        'https://images.unsplash.com/photo-1783828704146-303e99169d50?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxOXx8fGVufDB8fHx8fA%3D%3D',
    },
  });
  console.log(
    `✅ Base users provisioned. Primary instructor ID: ${instructor.id}`,
  );
  return { instructorId: instructor.id };
}

export default async function seed() {
  try {
    await cleanDatabase();
    const { instructorId } = await provisionInitialUsers();
    const dataPath = path.join(__dirname, '../data');

    if (!fs.existsSync(dataPath)) {
      throw new Error(
        `Data mapping path directory missing at location: ${dataPath}`,
      );
    }

    const files = fs
      .readdirSync(dataPath)
      .filter((file) => file.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(dataPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (file.startsWith('courses')) {
        console.log(`Executing transaction block load sequence for: ${file}`);
        for (const courseItem of data) {
          const { sections, ...courseMetadata } = courseItem;
          await db.course.create({
            data: {
              slug: courseMetadata.slug,
              title: courseMetadata.title,
              description: courseMetadata.description || null,
              category: courseMetadata.category,
              image: courseMetadata.image || null,
              price: Math.round((courseMetadata.price || 0) * 100),
              level: courseMetadata.level,
              status: courseMetadata.status,
              instructorId: instructorId,
              sections: {
                create: sections.map((section: any) => ({
                  title: section.title,
                  order: section.order,
                  lectures: {
                    create: section.lectures.map((lecture: any) => ({
                      slug: `lec_${nanoid(8)}`,
                      title: lecture.title,
                      type: lecture.type,
                      videoKey: lecture.videoUrl || lecture.videoKey || null,
                      pdfKey: lecture.pdfKey || null,
                      content: lecture.content || null,
                      order: lecture.order,
                    })),
                  },
                })),
              },
            },
          });
        }
        console.log(
          `\x1b[32m%s\x1b[0m`,
          `Successfully mapped and seeded relational parameters from: ${file}`,
        );
      }
    }

    console.log('🎉 Global seeding pipeline fully processed.');
  } catch (error) {
    console.error(
      'Critical system failure during database initialization pipeline:',
      error,
    );
    throw error;
  } finally {
    await db.$disconnect();
  }
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution && process.env.NODE_ENV === 'production') {
  console.error('Refusing to run the destructive seed script in production.');
  process.exit(1);
}

if (isDirectExecution) {
  seed().catch((error) => {
    console.error(
      '❌ Execution halted due to an unhandled seed pipeline failure:',
      error,
    );
    process.exit(1);
  });
}
