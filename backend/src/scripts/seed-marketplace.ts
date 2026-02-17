import 'reflect-metadata';
import * as path from 'path';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { typeormEntities } from '../config/typeorm.config';
import { Tutor, TutorStatus } from '../tutors/entities/tutor.entity';
import { TutorApplication, ApplicationStatus } from '../tutors/entities/tutor-application.entity';
import { Course } from '../courses/entities/course.entity';

config({ path: path.resolve(__dirname, '../../.env') });
config(); // fallback to process defaults if .env missing

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tutor_dashboard',
  entities: typeormEntities,
  synchronize: false,
  logging: false,
};

const dataSource = new DataSource(dataSourceOptions);

const FIRST_NAMES = [
  'Lerato',
  'Sipho',
  'Nandi',
  'Thabo',
  'Ayanda',
  'Kabelo',
  'Naledi',
  'Zinhle',
  'Sibusiso',
  'Onkarabile',
];

const LAST_NAMES = [
  'Mokoena',
  'Khumalo',
  'Ndlovu',
  'Pillay',
  'van der Merwe',
  'Mbatha',
  'Nkosi',
  'Molefe',
  'Govender',
  'Zulu',
];

const SUBJECT_POOL = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Accounting',
  'Economics',
  'Business Studies',
  'Computer Science',
  'Programming Fundamentals',
  'English',
  'History',
  'Geography',
];

const LEVELS = [
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'First Year',
  'Second Year',
  'Third Year',
];

const CITIES = [
  'Johannesburg',
  'Pretoria',
  'Cape Town',
  'Durban',
  'Bloemfontein',
  'Stellenbosch',
  'Port Elizabeth',
  'Polokwane',
  'East London',
];

const COURSE_TEMPLATES = [
  {
    name: 'Exam Excellence Programme',
    description: 'Targeted revision plans, timed drills, and confidence coaching.',
  },
  {
    name: 'Concept Booster Sessions',
    description: 'Weekly deep dives into tricky topics with practical examples.',
  },
  {
    name: 'Assignment Studio',
    description: 'Guided support for projects and essays with structured feedback.',
  },
  {
    name: 'Problem-Solving Lab',
    description: 'Work through tough exam questions while learning strategy and timing.',
  },
  {
    name: 'STEM Mastery Track',
    description: 'Project-based learning across maths and science with real-world scenarios.',
  },
  {
    name: 'Language Fluency Path',
    description: 'Tools for essay building, vocabulary, and critical writing practice.',
  },
  {
    name: 'University Transition Prep',
    description: 'Bridge the gap between high school and campus-level study routines.',
  },
  {
    name: 'Coding Sprint Bootcamp',
    description: 'Hands-on coding, debugging, and software design for university students.',
  },
];

const pickRandom = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const pickRandomSubset = <T>(items: T[], count: number): T[] => {
  const copy = [...items];
  const subset: T[] = [];
  while (subset.length < count && copy.length > 0) {
    const index = Math.floor(Math.random() * copy.length);
    subset.push(copy.splice(index, 1)[0]);
  }
  return subset;
};

async function seedMarketplaceTutors() {
  await dataSource.initialize();
  await dataSource.synchronize();
  const tutorRepo = dataSource.getRepository(Tutor);
  const applicationRepo = dataSource.getRepository(TutorApplication);
  const courseRepo = dataSource.getRepository(Course);

  const approvedTutors = await tutorRepo.count({ where: { status: TutorStatus.APPROVED } });
  const targetCount = 50;

  if (approvedTutors >= targetCount) {
    console.log(`Marketplace already has ${approvedTutors} approved tutors. No new tutors added.`);
    process.exit(0);
  }

  const tutorsNeeded = targetCount - approvedTutors;
  const hashedPassword = await bcrypt.hash(process.env.SEED_TUTOR_PASSWORD || 'Tutor123!', 10);

  const createdTutorIds: string[] = [];

  for (let i = 0; i < tutorsNeeded; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${approvedTutors + i}@seedtutors.com`;
    const subjects = pickRandomSubset(SUBJECT_POOL, 3);

    const tutor = tutorRepo.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      location: pickRandom(CITIES),
      subjects: subjects.join(', '),
      qualifications: `${pickRandom(subjects)} specialist – ${pickRandom([
        'BSc',
        'BEd',
        'MSc',
        'BCom',
      ])}`,
      experience: `Helping students master ${pickRandom(subjects)} for ${3 + (i % 6)} years.`,
      status: TutorStatus.APPROVED,
      rating: Number((4 + Math.random()).toFixed(2)),
      totalSessions: 25 + Math.floor(Math.random() * 90),
      totalStudents: 5 + Math.floor(Math.random() * 25),
      firstLessonDate: new Date(2017 + (i % 5), i % 12, (i % 27) + 1),
    });

    const savedTutor = await tutorRepo.save(tutor);
    createdTutorIds.push(savedTutor.id);

    await applicationRepo.save(
      applicationRepo.create({
        tutorId: savedTutor.id,
        status: ApplicationStatus.APPROVED,
      }),
    );

    const MIN_COURSES = 2;
    const MAX_COURSES = Math.min(COURSE_TEMPLATES.length, 6);
    const courseCount = MIN_COURSES + Math.floor(Math.random() * (MAX_COURSES - MIN_COURSES + 1));
    const courseTemplates = pickRandomSubset(COURSE_TEMPLATES, courseCount);
    for (let idx = 0; idx < courseTemplates.length; idx++) {
      const template = courseTemplates[idx];
      const subject = subjects[idx % subjects.length];
      const course = courseRepo.create({
        tutorId: savedTutor.id,
        name: `${subject} ${template.name}`,
        subject,
        level: pickRandom(LEVELS),
        description: `${template.description} Focus on ${subject} fundamentals.`,
      });
      await courseRepo.save(course);
    }
  }

  console.log(`Seeded ${createdTutorIds.length} approved tutors for the marketplace.`);
  await dataSource.destroy();
  process.exit(0);
}

seedMarketplaceTutors().catch((error) => {
  console.error('Failed to seed marketplace tutors:', error);
  dataSource.destroy();
  process.exit(1);
});

