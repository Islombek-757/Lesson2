import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';
import Subject from '../models/Subject';
import Topic from '../models/Topic';
import Lesson from '../models/Lesson';
import Quiz from '../models/Quiz';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-os');

    await Promise.all([
      User.deleteMany({}),
      Subject.deleteMany({}),
      Topic.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({})
    ]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@schoolos.com',
      password: 'admin123',
      role: 'admin'
    });

    const teacher = await User.create({
      name: 'Prof. Thompson',
      email: 'teacher@schoolos.com',
      password: 'teacher123',
      role: 'teacher'
    });

    await User.create({
      name: 'Student Demo',
      email: 'student@schoolos.com',
      password: 'student123',
      role: 'student',
      xp: 450,
      level: 1,
      streak: 4
    });

    const subjects = await Subject.insertMany([
      {
        title: 'Mathematics',
        slug: 'mathematics',
        description: 'Algebra, Geometry and Calculus fundamentals.',
        icon: '📐',
        color: '#6366f1',
        createdBy: teacher._id,
        order: 1
      },
      {
        title: 'Physics',
        slug: 'physics',
        description: 'Mechanics, Electricity and Motion.',
        icon: '⚡',
        color: '#f59e0b',
        createdBy: teacher._id,
        order: 2
      },
      {
        title: 'English',
        slug: 'english',
        description: 'Grammar, Vocabulary and Communication.',
        icon: '📝',
        color: '#10b981',
        createdBy: teacher._id,
        order: 3
      }
    ]);

    const algebraTopic = await Topic.create({
      title: 'Algebra Basics',
      slug: 'algebra-basics',
      description: 'Linear expressions and equations',
      subject: subjects[0]._id,
      createdBy: teacher._id,
      order: 1
    });

    const lesson = await Lesson.create({
      title: 'Solving Linear Equations',
      slug: 'solving-linear-equations-demo',
      description: 'Learn how to solve one-variable linear equations step by step.',
      content:
        'A linear equation is an equation where the highest power of variable is 1.\n\nExample: 2x + 5 = 17\n1) Subtract 5 from both sides: 2x = 12\n2) Divide both sides by 2: x = 6\n\nAlways perform the same operation on both sides to keep the equation balanced.',
      subject: subjects[0]._id,
      topic: algebraTopic._id,
      tags: ['algebra', 'equations', 'beginner'],
      difficulty: 'beginner',
      duration: 15,
      xpReward: 50,
      isPublished: true,
      createdBy: teacher._id
    });

    await Quiz.create({
      title: 'Linear Equations Quick Quiz',
      lesson: lesson._id,
      subject: subjects[0]._id,
      timeLimit: 600,
      passingScore: 70,
      maxAttempts: 3,
      isPublished: true,
      xpReward: 100,
      createdBy: teacher._id,
      questions: [
        {
          question: 'Solve: 3x + 6 = 15',
          options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
          correctAnswer: 1,
          explanation: '3x = 9, so x = 3.',
          points: 10
        },
        {
          question: 'Solve: x - 7 = 5',
          options: ['x = 10', 'x = 11', 'x = 12', 'x = 13'],
          correctAnswer: 2,
          explanation: 'Add 7 to both sides: x = 12.',
          points: 10
        }
      ]
    });

    console.log('✅ Database seeded successfully');
    console.log('👤 Admin: admin@schoolos.com / admin123');
    console.log('👨‍🏫 Teacher: teacher@schoolos.com / teacher123');
    console.log('🎓 Student: student@schoolos.com / student123');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
