/**
 * Content-Based Skill Recommendation Engine
 * Maps student assessment answers to course interest tags and ranks courses.
 */

const COURSE_INTEREST_MAP = {
  Abacus: ['numbers', 'mathematics', 'calculations', 'numerical ability', 'working with numbers', 'abacus'],
  Coding: ['computers', 'technology', 'programming', 'computer skills', 'using computers', 'coding', 'computer science', 'computer activities'],
  'Communication Skills': ['speaking', 'english', 'communication', 'presentation', 'speaking with others', 'communication skills', 'vocabulary'],
  'Logical Reasoning': ['puzzles', 'mathematics', 'problem solving', 'logical thinking', 'solving puzzles', 'logical reasoning', 'general knowledge', 'patterns'],
};

const ANSWER_TO_INTEREST = {
  'Working with numbers': ['numbers', 'calculations', 'numerical ability'],
  'Using computers': ['computers', 'technology', 'computer skills'],
  'Speaking with others': ['speaking', 'communication'],
  'Solving puzzles': ['puzzles', 'problem solving', 'logical thinking'],
  Abacus: ['abacus', 'numbers', 'calculations', 'numerical ability'],
  Coding: ['coding', 'computers', 'programming', 'computer skills'],
  'Communication Skills': ['communication', 'speaking', 'english'],
  'Logical Reasoning': ['logical thinking', 'problem solving', 'puzzles'],
  Mathematics: ['mathematics', 'numbers', 'calculations'],
  'Computer Science': ['computers', 'technology', 'programming', 'computer science'],
  English: ['english', 'communication', 'speaking'],
  'General Knowledge': ['general knowledge', 'logical thinking'],
  Calculations: ['calculations', 'numbers', 'numerical ability', 'mathematics'],
  'Computer activities': ['computers', 'computer skills', 'technology'],
  Speaking: ['speaking', 'communication'],
  'Problem solving': ['problem solving', 'logical thinking', 'puzzles'],
  'Numerical ability': ['numerical ability', 'numbers', 'calculations', 'mathematics'],
  'Computer skills': ['computer skills', 'computers', 'technology'],
  Communication: ['communication', 'speaking', 'english'],
  'Logical thinking': ['logical thinking', 'problem solving', 'puzzles'],
};

function extractInterests(assessmentAnswers) {
  const interests = new Set();
  (assessmentAnswers || []).forEach((answer) => {
    const mapped = ANSWER_TO_INTEREST[answer];
    if (mapped) {
      mapped.forEach((tag) => interests.add(tag.toLowerCase()));
    } else if (answer) {
      interests.add(String(answer).toLowerCase());
    }
  });
  return Array.from(interests);
}

function generateReason(courseName, matchedTags) {
  if (matchedTags.length === 0) {
    return `A foundational skill course that may broaden your learning path.`;
  }
  const display = matchedTags.slice(0, 3).join(', ');
  return `Recommended because of your interest in ${display}.`;
}

/**
 * @param {string[]} assessmentAnswers - Selected answers from interest assessment
 * @param {Array<{_id?: string, name: string}>} courses - Course documents from DB
 * @returns {Array<{course: string, score: number, reason: string, courseId?: string}>}
 */
function recommendCourses(assessmentAnswers, courses = []) {
  const studentInterests = extractInterests(assessmentAnswers);

  const courseList =
    courses.length > 0
      ? courses
      : Object.keys(COURSE_INTEREST_MAP).map((name) => ({ name }));

  const scored = courseList.map((courseDoc) => {
    const courseName = courseDoc.name;
    const tags = (courseDoc.interestTags && courseDoc.interestTags.length
      ? courseDoc.interestTags
      : COURSE_INTEREST_MAP[courseName] || []
    ).map((t) => t.toLowerCase());

    const matchedTags = tags.filter((tag) =>
      studentInterests.some(
        (interest) => interest.includes(tag) || tag.includes(interest)
      )
    );

    const rawScore = tags.length === 0 ? 0 : matchedTags.length / tags.length;
    const score = Math.round(rawScore * 100);

    return {
      course: courseName,
      score,
      reason: generateReason(courseName, matchedTags),
      courseId: courseDoc._id || null,
      matchedTags,
    };
  });

  // Normalize relative to max so top match is highlighted fairly
  const maxScore = Math.max(...scored.map((s) => s.score), 1);
  const normalized = scored.map((item) => ({
    course: item.course,
    score: Math.round((item.score / maxScore) * 100),
    reason: item.reason,
    courseId: item.courseId,
  }));

  return normalized.sort((a, b) => b.score - a.score);
}

module.exports = {
  recommendCourses,
  extractInterests,
  COURSE_INTEREST_MAP,
  ANSWER_TO_INTEREST,
};
