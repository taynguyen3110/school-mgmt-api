import { MongoClient, Document } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-connection-string';

interface User {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  role: string;
  isBlocked: boolean;
  profileUrl: string;
}

interface Class {
  id: string;
  name: string;
  studentIds: string[];
}

interface Subject {
  id: string;
  name: string;
  teacherId: string;
  classId: string;
  daysOfWeek: string[];
}

interface Teacher {
  id: string;
  lastName: string;
  firstName: string;
  address: string;
  email: string;
  gender: string;
  phone: string;
  profileUrl: string;
  admissionDate: string;
}

interface Parent {
  id: string;
  lastName: string;
  firstName: string;
  address: string;
  email: string;
  phone: string;
  profileUrl: string;
}

interface Student {
  id: string;
  lastName: string;
  firstName: string;
  address: string;
  email: string;
  gender: string;
  phone: string;
  profileUrl: string;
  admissionDate: string;
  classId: string;
  parentId: string;
}

interface DatabaseData {
  users: Record<string, User>;
  classes: Record<string, Class>;
  subjects: Record<string, Subject>;
  teachers: Record<string, Teacher>;
  students: Record<string, Student>;
  parents: Record<string, Parent>;
}

async function clearCollections(db: any) {
  const collections = [
    'users',
    'classes',
    'subjects',
    'teachers',
    'students',
    'parents'
  ];

  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      await collection.deleteMany({});
      console.log(`Cleared ${collectionName} collection`);
    } catch (error) {
      console.error(`Error clearing ${collectionName} collection:`, error);
    }
  }
  console.log('All collections cleared successfully');
}

async function migrateData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    // Get the database
    const db = client.db('school-management');

    // Clear all collections first
    await clearCollections(db);

    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8')) as DatabaseData;

    // Migrate Users
    if (jsonData.users) {
      const usersCollection = db.collection('users');
      const users = Object.values(jsonData.users) as Document[];
      await usersCollection.insertMany(users);
      console.log(`Migrated ${users.length} users`);
    }

    // Migrate Classes
    if (jsonData.classes) {
      const classesCollection = db.collection('classes');
      const classes = Object.values(jsonData.classes) as Document[];
      await classesCollection.insertMany(classes);
      console.log(`Migrated ${classes.length} classes`);
    }

    // Migrate Subjects
    if (jsonData.subjects) {
      const subjectsCollection = db.collection('subjects');
      const subjects = Object.values(jsonData.subjects) as Document[];
      await subjectsCollection.insertMany(subjects);
      console.log(`Migrated ${subjects.length} subjects`);
    }

    // Migrate Teachers
    if (jsonData.teachers) {
      const teachersCollection = db.collection('teachers');
      const teachers = Object.values(jsonData.teachers) as Document[];
      await teachersCollection.insertMany(teachers);
      console.log(`Migrated ${teachers.length} teachers`);
    }

    // Migrate Students
    if (jsonData.students) {
      const studentsCollection = db.collection('students');
      const students = Object.values(jsonData.students) as Document[];
      await studentsCollection.insertMany(students);
      console.log(`Migrated ${students.length} students`);
    }

    // Migrate Parents
    if (jsonData.parents) {
      const parentsCollection = db.collection('parents');
      const parents = Object.values(jsonData.parents) as Document[];
      await parentsCollection.insertMany(parents);
      console.log(`Migrated ${parents.length} parents`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }
}

// Run the migration
migrateData(); 