require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const studentsRoutes = require('./routes/studentsRoutes');
// Later-phase routes kept mounted but not used by Phase 2 UI
const studentRoutes = require('./routes/studentRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const courseRoutes = require('./routes/courseRoutes');
const classRoutes = require('./routes/classRoutes');
const quizRoutes = require('./routes/quizRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const progressRoutes = require('./routes/progressRoutes');
const materialRoutes = require('./routes/materialRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Community Education API running' });
});

// Phase 2 — Student Authentication
app.use('/api/students', studentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Phase 8 — Learning Progress
app.use('/api/progress', progressRoutes);

// Reserved / earlier phases
app.use('/api/student', studentRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/materials', materialRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
