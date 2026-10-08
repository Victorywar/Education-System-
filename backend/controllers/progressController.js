const Progress = require('../models/Progress');
const Student = require('../models/Student');
const { getSkill, isValidSkillModule, skillsCatalog } = require('../data/skillsCatalog');
const {
  generateChallenge,
  publicChallenge,
  normalizeAnswer,
  evaluateSpeech,
} = require('../data/levelChallenges');
const { getQuizResultsByStudent } = require('./quizController');
const crypto = require('crypto');

const PASSING_SCORE = 70;
const DAY_IN_MS = 1000 * 60 * 60 * 24;

const calcPercentage = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

const buildSkillProgressResponse = (skill, progressDoc, quiz = null) => {
  const completedSet = new Set(
    (progressDoc?.completedModules || []).map((m) => m.moduleId)
  );
  const totalModules = skill.modules.length;
  const completedModules = skill.modules.filter((m) => completedSet.has(m.id)).length;
  const percentage = calcPercentage(completedModules, totalModules);
  const completedLevels = progressDoc?.completedLevels || [];
  const completedLevelNumbers = new Set(completedLevels.map((level) => level.levelNumber));
  const currentLevel = progressDoc?.currentLevel || 1;
  const levelPercentage = calcPercentage(completedLevelNumbers.size, 10);

  return {
    skillId: skill.id,
    skillName: skill.name,
    totalModules,
    completedModules,
    percentage: levelPercentage,
    legacyPercentage: percentage,
    status: progressDoc?.isCourseCompleted
      ? 'Completed'
      : completedLevelNumbers.size > 0 || completedModules > 0
        ? 'In Progress'
        : 'Not Started',
    currentLevel,
    completedLevels: completedLevels.map((level) => ({
      levelNumber: level.levelNumber,
      score: level.score,
      completedAt: level.completedAt,
    })),
    totalXp: progressDoc?.totalXp || 0,
    isCourseCompleted: !!progressDoc?.isCourseCompleted,
    certificateId: progressDoc?.certificateId || null,
    certificateIssuedAt: progressDoc?.certificateIssuedAt || null,
    levels: Array.from({ length: 10 }, (_, index) => ({
      levelNumber: index + 1,
      completed: completedLevelNumbers.has(index + 1),
      unlocked: index + 1 <= currentLevel || completedLevelNumbers.has(index + 1),
      score: completedLevels.find((level) => level.levelNumber === index + 1)?.score || null,
    })),
    modules: skill.modules.map((m) => ({
      moduleId: m.id,
      title: m.title,
      completed: completedSet.has(m.id),
    })),
    quiz: quiz
      ? {
          score: quiz.score,
          total: quiz.total,
          percentage: quiz.percentage,
          performance: quiz.performance,
          resultId: quiz.resultId,
        }
      : null,
  };
};

const matchQuizToSkill = (skill, quizResults) => {
  if (!quizResults?.length) return null;
  return (
    quizResults.find((q) => q.skillId === skill.id) ||
    quizResults.find(
      (q) => q.courseName && q.courseName.toLowerCase() === skill.name.toLowerCase()
    ) ||
    (skill.id === 'communication'
      ? quizResults.find((q) => q.skillId === 'communication-skills')
      : null)
  );
};

const getAllProgress = async (req, res) => {
  try {
    const records = await Progress.find({ studentId: req.user._id });
    const bySkill = Object.fromEntries(records.map((r) => [r.skillId, r]));
    const quizResults = await getQuizResultsByStudent(req.user._id);

    const items = skillsCatalog
      .map((skill) =>
        buildSkillProgressResponse(
          skill,
          bySkill[skill.id],
          matchQuizToSkill(skill, quizResults)
        )
      )
      .filter((item) => item.completedModules > 0 || item.completedLevels.length > 0 || item.quiz);

    return res.json({
      success: true,
      progress: items,
      latestQuizzes: quizResults,
    });
  } catch (error) {
    console.error('Get all progress error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your progress.',
    });
  }
};

const getSkillProgress = async (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = getSkill(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found.',
      });
    }

    const progressDoc = await Progress.findOne({
      studentId: req.user._id,
      skillId: skill.id,
    });
    const quizResults = await getQuizResultsByStudent(req.user._id);
    const quiz = matchQuizToSkill(skill, quizResults);
    const result = buildSkillProgressResponse(skill, progressDoc, quiz);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get skill progress error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to load your progress.',
    });
  }
};

const getLevelChallenge = async (req, res) => {
  const skill = getSkill(req.params.skillId);
  const levelNumber = Number(req.params.levelNumber);
  if (!skill || !Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 10) {
    return res.status(404).json({ success: false, message: 'Learning level not found.' });
  }
  try {
    const progress = await Progress.findOne({
      studentId: req.user._id,
      skillId: skill.id,
    });
    const currentLevel = progress?.currentLevel || 1;
    const completed = (progress?.completedLevels || []).some(
      (level) => level.levelNumber === levelNumber
    );
    if (levelNumber > currentLevel && !completed) {
      return res.status(403).json({
        success: false,
        message: 'Complete the previous level with at least 70% accuracy to unlock this level.',
        currentLevel,
      });
    }
    return res.json({
      success: true,
      challenge: publicChallenge(generateChallenge(skill, levelNumber)),
      completed,
      currentLevel,
    });
  } catch (error) {
    console.error('Get level challenge error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load this level challenge.' });
  }
};

const checkLevelAnswer = async (req, res) => {
  const skill = getSkill(req.params.skillId);
  const levelNumber = Number(req.params.levelNumber);
  if (!skill || !Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 10) {
    return res.status(404).json({ success: false, message: 'Learning level not found.' });
  }
  const { questionId, answer } = req.body;
  if (
    (typeof questionId !== 'string' && !Number.isInteger(questionId)) ||
    typeof answer !== 'string' ||
    !answer.trim()
  ) {
    return res.status(400).json({ success: false, message: 'A question and answer are required.' });
  }

  try {
    const progress = await Progress.findOne({
      studentId: req.user._id,
      skillId: skill.id,
    });
    const currentLevel = progress?.currentLevel || 1;
    if (levelNumber > currentLevel) {
      return res.status(403).json({
        success: false,
        message: 'This level is locked until you pass the previous level.',
      });
    }

    const challenge = generateChallenge(skill, levelNumber);
    const question = challenge.questions.find((item) => String(item.id) === String(questionId));
    if (!question) {
      return res.status(400).json({ success: false, message: 'Invalid challenge question.' });
    }

    await Student.updateOne({ _id: req.user._id }, { $set: { lastActiveAt: new Date() } });
    if (question.inputType === 'speech') {
      const result = evaluateSpeech(question.targetText, answer);
      return res.json({
        success: true,
        correct: result.accuracy >= PASSING_SCORE,
        accuracy: result.accuracy,
        words: result.words,
        explanation: 'Accuracy is based on the target words recognized in the correct order.',
        targetText: question.targetText,
      });
    }

    const correct =
      normalizeAnswer(answer) === normalizeAnswer(question.options[question.correctAnswer]);
    return res.json({
      success: true,
      correct,
      explanation: question.explanation,
      correctAnswer: correct ? undefined : question.options[question.correctAnswer],
    });
  } catch (error) {
    console.error('Check level answer error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to check your answer.' });
  }
};

const submitLevel = async (req, res) => {
  const skill = getSkill(req.params.skillId);
  const levelNumber = Number(req.params.levelNumber);
  if (!skill || !Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 10) {
    return res.status(404).json({ success: false, message: 'Learning level not found.' });
  }
  if (!Array.isArray(req.body.answers)) {
    return res.status(400).json({ success: false, message: 'Submit answers for the complete challenge.' });
  }

  try {
    let progress = await Progress.findOne({
      studentId: req.user._id,
      skillId: skill.id,
    });
    const currentLevel = progress?.currentLevel || 1;
    if (levelNumber !== currentLevel) {
      if (levelNumber < currentLevel) {
        return res.status(409).json({ success: false, message: 'This level has already been completed.' });
      }
      return res.status(403).json({
        success: false,
        message: 'Complete the previous level with at least 70% accuracy to unlock this level.',
        currentLevel,
      });
    }

    const challenge = generateChallenge(skill, levelNumber);
    const submitted = new Map();
    for (const item of req.body.answers) {
      if (
        !item ||
        (typeof item.questionId !== 'string' && !Number.isInteger(item.questionId)) ||
        typeof item.answer !== 'string'
      ) {
        return res.status(400).json({ success: false, message: 'Challenge answers are invalid.' });
      }
      submitted.set(String(item.questionId), item.answer);
    }
    if (challenge.questions.some((question) => !submitted.has(String(question.id)))) {
      return res.status(400).json({ success: false, message: 'Answer every challenge question before submitting.' });
    }

    const questionScores = challenge.questions.map((question) => {
      const answer = submitted.get(String(question.id));
      if (question.inputType === 'speech') {
        return evaluateSpeech(question.targetText, answer).accuracy;
      }
      return normalizeAnswer(answer) ===
        normalizeAnswer(question.options[question.correctAnswer])
        ? 100
        : 0;
    });
    const score = Math.round(
      questionScores.reduce((sum, questionScore) => sum + questionScore, 0) /
        questionScores.length
    );

    const passed = score >= PASSING_SCORE;
    const completedAlready = (progress?.completedLevels || []).some(
      (level) => level.levelNumber === levelNumber
    );
    if (!progress) {
      progress = new Progress({
        studentId: req.user._id,
        skillId: skill.id,
        currentLevel: 1,
        completedLevels: [],
        totalXp: 0,
      });
    }
    let xpEarned = 0;
    if (passed && !completedAlready) {
      xpEarned = 50 + levelNumber * 10;
      progress.completedLevels.push({
        levelNumber,
        score,
        completedAt: new Date(),
      });
      const moduleId = skill.modules[levelNumber - 1]?.id;
      if (moduleId && !progress.completedModules.some((module) => module.moduleId === moduleId)) {
        progress.completedModules.push({ moduleId, completedAt: new Date() });
      }
      progress.currentLevel = Math.min(levelNumber + 1, 10);
      progress.totalXp += xpEarned;

      if (levelNumber === 10) {
        progress.isCourseCompleted = true;
        progress.certificateIssuedAt = new Date();
        const skillCode = skill.id.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
        const timestamp = Date.now();
        const verificationHash = crypto.randomBytes(8).toString('hex').toUpperCase();
        progress.certificateId = `CERT-${skillCode}-${timestamp}-${verificationHash}`;
      }
    }
    await progress.save();
    await Student.updateOne({ _id: req.user._id }, { $set: { lastActiveAt: new Date() } });

    return res.json({
      success: true,
      passed,
      score,
      passingScore: PASSING_SCORE,
      xpEarned,
      currentLevel: progress.currentLevel,
      unlockedLevels: Array.from({ length: 10 }, (_, index) => index + 1)
        .filter((level) => level <= progress.currentLevel),
      isCourseCompleted: progress.isCourseCompleted,
      certificateId: progress.certificateId || null,
      progress: buildSkillProgressResponse(skill, progress),
      message: passed ? 'Level cleared!' : 'Keep practicing and try this level again.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Level progress was updated in another request. Reload your progress and try again.',
      });
    }
    console.error('Submit level error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to submit this level.' });
  }
};

const completeModule = async (req, res) => {
  try {
    const { skillId: requestedSkillId, moduleId } = req.params;

    const skill = getSkill(requestedSkillId);
    if (!skill || !isValidSkillModule(skill.id, moduleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid learning module.',
      });
    }

    let progressDoc = await Progress.findOneAndUpdate(
      {
        studentId: req.user._id,
        skillId: skill.id,
      },
      { $setOnInsert: { studentId: req.user._id, skillId: skill.id } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await Student.updateOne(
      { _id: req.user._id },
      { $set: { lastActiveAt: new Date() } }
    );

    const alreadyCompleted = progressDoc.completedModules.some(
      (module) => module.moduleId === moduleId
    );
    if (!alreadyCompleted) {
      progressDoc.completedModules.push({ moduleId, completedAt: new Date() });
      await progressDoc.save();
    }
    const updated = buildSkillProgressResponse(skill, progressDoc);
    const percentage = calcPercentage(updated.completedModules, updated.totalModules);
    const status = percentage === 100 ? 'Completed' : 'In Progress';
    const completedModules = progressDoc.completedModules.map((module) => ({
      moduleId: module.moduleId,
      completedAt: module.completedAt,
    }));

    return res.json({
      success: true,
      message: 'Module completion saved.',
      alreadyCompleted,
      completedModules,
      percentage,
      status,
      progress: {
        completedModules,
        totalModules: updated.totalModules,
        percentage,
        status,
      },
      detail: updated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Unable to update progress. Please try again.',
      });
    }
    console.error('Complete module error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to update progress. Please try again.',
    });
  }
};

const getProgressSummaryForStudent = async (studentId) => {
  const records = await Progress.find({ studentId });
  if (!records.length) {
    return {
      hasProgress: false,
      progressStatus: 'Not Started',
      highlight: null,
    };
  }

  let best = null;
  for (const record of records) {
    const skill = getSkill(record.skillId);
    if (!skill) continue;
    const built = buildSkillProgressResponse(skill, record);
    if (!best || built.percentage > best.percentage) best = built;
  }

  return {
    hasProgress: true,
    progressStatus: best ? `${best.percentage}%` : 'In Progress',
    highlight: best,
  };
};

module.exports = {
  getAllProgress,
  getSkillProgress,
  getLevelChallenge,
  checkLevelAnswer,
  submitLevel,
  completeModule,
  getProgressSummaryForStudent,
  buildSkillProgressResponse,
};
