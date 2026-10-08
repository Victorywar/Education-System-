/**
 * Extract coursesData from seed — safe upsert without wiping students/classes.
 * Run: npm run seed:courses
 */
require('dotenv').config();
const connectDB = require('../config/database');
const Course = require('../models/Course');

// Reuse course definitions from main seed file structure
const { coursesData } = require('./coursesData');

const seedCourses = async () => {
  try {
    await connectDB();

    for (const course of coursesData) {
      const existing = await Course.findOne({ slug: course.slug });
      if (existing) {
        existing.name = course.name;
        existing.description = course.description;
        existing.level = course.level;
        existing.duration = course.duration;
        existing.interestTags = course.interestTags;
        existing.modules = course.modules;
        existing.quiz = course.quiz;
        await existing.save();
        console.log(`Updated course: ${course.name}`);
      } else {
        await Course.create(course);
        console.log(`Created course: ${course.name}`);
      }
    }

    console.log('Course seed complete (safe upsert).');
    process.exit(0);
  } catch (error) {
    console.error('Course seed failed:', error);
    process.exit(1);
  }
};

seedCourses();
