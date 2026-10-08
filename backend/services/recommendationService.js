/**
 * Phase 5 — Rule-based weighted skill recommendation engine
 *
 * Each assessment answer maps to a skill category (+1 point).
 * Skills are sorted by score (desc). Ties keep fixed skill order.
 * No external AI / ML APIs.
 */

const SKILL_ORDER = ['Abacus', 'Coding', 'Communication Skills', 'Logical Reasoning'];

const TOTAL_QUESTIONS = 5;

const EXPLANATIONS = {
  Abacus:
    'Your answers show a strong interest in numbers, calculations and mathematical activities.',
  Coding:
    'Your answers show a strong interest in computers and technology-related activities.',
  'Communication Skills':
    'Your answers show a strong interest in speaking, English and communication-related activities.',
  'Logical Reasoning':
    'Your answers show a strong interest in puzzles, problem solving and logical thinking.',
};

/**
 * @param {Array<{ category?: string }>} answers
 * @returns {{ Abacus: number, Coding: number, "Communication Skills": number, "Logical Reasoning": number }}
 */
function calculateSkillScores(answers) {
  const scores = {
    Abacus: 0,
    Coding: 0,
    'Communication Skills': 0,
    'Logical Reasoning': 0,
  };

  (answers || []).forEach((item) => {
    const category = item?.category;
    if (category && Object.prototype.hasOwnProperty.call(scores, category)) {
      scores[category] += 1;
    }
  });

  return scores;
}

function getMatchLevel(score) {
  if (score >= 3) return 'Strong Match';
  if (score === 2) return 'Good Match';
  if (score === 1) return 'Possible Match';
  return 'Low Match';
}

function getExplanation(skill) {
  return EXPLANATIONS[skill] || 'Your answers indicate this skill may be a useful learning path.';
}

/**
 * Build ranked recommendations from assessment answers.
 * @param {Array<{ questionId?: number, answer?: string, category?: string }>} answers
 * @returns {{ topRecommendation: object, recommendations: object[], scores: object }}
 */
function generateRecommendations(answers) {
  const scores = calculateSkillScores(answers);
  const total = TOTAL_QUESTIONS;

  const recommendations = SKILL_ORDER.map((skill) => {
    const score = scores[skill] || 0;
    const percentage = Math.round((score / total) * 100);
    return {
      skill,
      score,
      percentage,
      level: getMatchLevel(score),
      explanation: getExplanation(skill),
    };
  });

  // Sort by score desc; ties keep SKILL_ORDER (stable sort on already ordered list)
  recommendations.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return SKILL_ORDER.indexOf(a.skill) - SKILL_ORDER.indexOf(b.skill);
  });

  const topRecommendation = {
    skill: recommendations[0].skill,
    score: recommendations[0].score,
    percentage: recommendations[0].percentage,
    level: recommendations[0].level,
    explanation: recommendations[0].explanation,
  };

  return {
    topRecommendation,
    recommendations,
    scores,
  };
}

module.exports = {
  calculateSkillScores,
  generateRecommendations,
  getMatchLevel,
  SKILL_ORDER,
  TOTAL_QUESTIONS,
};
