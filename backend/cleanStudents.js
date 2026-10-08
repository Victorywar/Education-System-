require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Student = require('./models/Student');
const Progress = require('./models/Progress');
const QuizResult = require('./models/QuizResult');
const Enrollment = require('./models/Enrollment');
const ClassSession = require('./models/Class');

const cleanStudents = async () => {
  try {
    await connectDB();

    const students = await Student.deleteMany({});
    console.log(`Students deleted: ${students.deletedCount}`);

    const progress = await Progress.deleteMany({});
    console.log(`Progress records deleted: ${progress.deletedCount}`);

    const quizResults = await QuizResult.deleteMany({});
    console.log(`Quiz results deleted: ${quizResults.deletedCount}`);

    const enrollments = await Enrollment.deleteMany({});
    console.log(`Enrollments deleted: ${enrollments.deletedCount}`);

    const classRegistrations = await ClassSession.updateMany(
      {},
      { $set: { registeredStudents: [] } }
    );
    console.log(`Classes with registrations reset: ${classRegistrations.modifiedCount}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Student data cleanup failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

cleanStudents();
