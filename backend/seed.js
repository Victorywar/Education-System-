require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const Course = require('./models/Course');
const Volunteer = require('./models/Volunteer');
const Student = require('./models/Student');
const { coursesData } = require('./seed/coursesData');

/**
 * Safe master seed — upserts courses, demo volunteer, demo student.
 * Does NOT wipe student progress, quiz results, or community classes.
 * For classes use: npm run seed:classes
 * For volunteer only: npm run seed:volunteer
 */
const seed = async () => {
  try {
    await connectDB();

    for (const course of coursesData) {
      const existing = await Course.findOne({ slug: course.slug });
      if (existing) {
        Object.assign(existing, {
          name: course.name,
          description: course.description,
          level: course.level,
          duration: course.duration,
          interestTags: course.interestTags,
          modules: course.modules,
          quiz: course.quiz,
        });
        await existing.save();
        console.log(`Updated course: ${course.name}`);
      } else {
        await Course.create(course);
        console.log(`Created course: ${course.name}`);
      }
    }

    const volHash = await bcrypt.hash('volunteer123', 10);
    const volunteer = await Volunteer.findOne({ username: 'volunteer' });
    if (volunteer) {
      volunteer.name = 'Midhuna';
      volunteer.password = volHash;
      volunteer.role = 'volunteer';
      volunteer.status = 'approved';
      volunteer.approvedAt = volunteer.approvedAt || new Date();
      await volunteer.save();
      console.log('Updated volunteer: volunteer / volunteer123');
    } else {
      await Volunteer.create({
        name: 'Midhuna',
        username: 'volunteer',
        password: volHash,
        role: 'volunteer',
        status: 'approved',
        approvedAt: new Date(),
      });
      console.log('Created volunteer: volunteer / volunteer123');
    }

    const studentHash = await bcrypt.hash('student123', 10);
    const student = await Student.findOne({ username: 'student' });
    if (student) {
      student.name = 'Demo Student';
      student.age = 14;
      student.className = '9';
      student.school = 'Government High School';
      student.location = 'North Zone';
      student.language = 'English';
      student.guardianContact = '9876543210';
      student.password = studentHash;
      student.role = 'student';
      await student.save();
      console.log('Updated demo student: student / student123');
    } else {
      await Student.create({
        name: 'Demo Student',
        age: 14,
        className: '9',
        school: 'Government High School',
        location: 'North Zone',
        language: 'English',
        guardianContact: '9876543210',
        username: 'student',
        password: studentHash,
        role: 'student',
        assessmentCompleted: false,
      });
      console.log('Created demo student: student / student123');
    }

    console.log('Seed completed successfully (safe upsert).');
    console.log('Tip: run npm run seed:classes for community class demo data.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
