require('dotenv').config();
const connectDB = require('../config/database');
const ClassSession = require('../models/Class');

/**
 * Safe upsert for Phase 9 demo community classes.
 * Does not wipe registrations for existing matching classes.
 * Run: node seed/classes.js
 */
const DEMO_CLASSES = [
  {
    skill: 'Abacus',
    title: 'Abacus Workshop',
    description: 'Community learning session for Abacus.',
    date: '2026-08-22',
    day: 'Saturday',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    location: 'Community Centre A',
    facilitator: 'Priya',
    capacity: 15,
  },
  {
    skill: 'Coding',
    title: 'Introduction to Coding',
    description: 'Beginner-friendly coding session.',
    date: '2026-08-23',
    day: 'Sunday',
    startTime: '2:00 PM',
    endTime: '3:00 PM',
    location: 'Community Centre B',
    facilitator: 'Priya',
    capacity: 10,
  },
  {
    skill: 'Communication Skills',
    title: 'Speak with Confidence',
    description: 'Practice everyday communication skills.',
    date: '2026-08-22',
    day: 'Saturday',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    location: 'Community Centre A',
    facilitator: 'Priya',
    capacity: 15,
  },
  {
    skill: 'Logical Reasoning',
    title: 'Problem Solving Basics',
    description: 'Holiday session for logical reasoning.',
    date: '2026-10-02',
    day: 'Holiday',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    location: 'Community Centre C',
    facilitator: 'Priya',
    capacity: 10,
  },
];

const seedClasses = async () => {
  try {
    await connectDB();

    for (const demo of DEMO_CLASSES) {
      const existing = await ClassSession.findOne({
        skill: demo.skill,
        day: demo.day,
        startTime: demo.startTime,
        location: demo.location,
      });

      if (existing) {
        existing.title = demo.title;
        existing.description = demo.description;
        existing.date = demo.date;
        existing.endTime = demo.endTime;
        existing.facilitator = demo.facilitator;
        const registered = existing.registeredStudents?.length || 0;
        existing.capacity = Math.max(demo.capacity, registered);
        await existing.save();
        console.log(`Updated: ${demo.skill} · ${demo.day} · ${demo.startTime}`);
      } else {
        await ClassSession.create({
          ...demo,
          registeredStudents: [],
        });
        console.log(`Created: ${demo.skill} · ${demo.day} · ${demo.startTime}`);
      }
    }

    console.log('Class seed complete (safe upsert).');
    process.exit(0);
  } catch (error) {
    console.error('Class seed failed:', error);
    process.exit(1);
  }
};

seedClasses();
