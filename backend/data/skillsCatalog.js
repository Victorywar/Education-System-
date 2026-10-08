const COURSE_CATALOG = [
  {
    id: 'logical-reasoning',
    name: 'Logical Reasoning & Aptitude',
    legacyNames: ['Logical Reasoning'],
    shortDescription: 'Solve patterns, aptitude puzzles, and critical-thinking challenges.',
    topics: [
      'Number series',
      'Patterns and rules',
      'Coding-decoding',
      'Odd one out',
      'Blood relations',
      'Direction sense',
      'Syllogisms',
      'Seating arrangements',
      'Critical thinking',
      'Aptitude mastery',
    ],
  },
  {
    id: 'coding',
    name: 'Coding & Computational Thinking',
    legacyNames: ['Coding'],
    shortDescription: 'Build algorithmic thinking with code tracing, logic, and debugging.',
    topics: [
      'Algorithms and instructions',
      'Variables and values',
      'Conditions',
      'Loops',
      'Counting loops',
      'Functions',
      'Debugging',
      'Nested logic',
      'Problem decomposition',
      'Computational thinking mastery',
    ],
  },
  {
    id: 'communication',
    name: 'Communication & Spoken English',
    legacyNames: ['Communication Skills'],
    shortDescription: 'Practice clear pronunciation, vocabulary, and everyday speaking.',
    topics: [
      'Clear pronunciation',
      'Everyday vocabulary',
      'Sentence reading',
      'Greetings and introductions',
      'Asking for help',
      'Listening and responding',
      'Explaining ideas',
      'Group conversation',
      'Workplace communication',
      'Confident speaking mastery',
    ],
  },
  {
    id: 'abacus',
    name: 'Abacus & Mental Math',
    legacyNames: ['Abacus'],
    shortDescription: 'Strengthen number sense with calculation and mental-math drills.',
    topics: [
      'Number representation',
      'Place value',
      'Addition',
      'Subtraction',
      'Complementary numbers',
      'Mixed operations',
      'Rapid calculation',
      'Mental arithmetic',
      'Multi-step drills',
      'Mental-math mastery',
    ],
  },
  {
    id: 'financial-literacy',
    name: 'Financial Literacy',
    legacyNames: [],
    shortDescription: 'Learn to save, budget, make safe payments, and avoid scams.',
    topics: [
      'Needs and wants',
      'Saving goals',
      'Simple budgets',
      'Comparing prices',
      'Planning purchases',
      'Banking basics',
      'Digital payments',
      'Recognizing scams',
      'Financial decisions',
      'Money-management mastery',
    ],
  },
  {
    id: 'digital-literacy',
    name: 'Digital & Computer Literacy',
    legacyNames: [],
    shortDescription: 'Build safe, confident computer and internet skills.',
    topics: [
      'Computer basics',
      'Keyboard and typing',
      'Files and folders',
      'Web browsing',
      'Internet safety',
      'Email etiquette',
      'Strong passwords',
      'Privacy and sharing',
      'Digital problem solving',
      'Digital-literacy mastery',
    ],
  },
];

const skillsCatalog = COURSE_CATALOG.map((course) => ({
  ...course,
  modules: course.topics.map((title, index) => ({
    id: `${course.id}-${index + 1}`,
    levelNumber: index + 1,
    questionCount: (index + 1) * 5,
    difficulty:
      index === 0
        ? 'Noob · Beginner'
        : index === 1
          ? 'Medium · Intermediate'
          : 'Pro · Advanced',
    title: `Level ${index + 1}: ${title}`,
  })),
}));

const getSkill = (skillId) =>
  skillsCatalog.find(
    (skill) =>
      skill.id === skillId ||
      skill.legacyNames.some((name) => name.toLowerCase().replace(/\s+/g, '-') === skillId)
  ) || null;

const getModule = (skill, moduleId) =>
  skill?.modules?.find((module) => module.id === moduleId) || null;

const isValidSkillModule = (skillId, moduleId) => {
  const skill = getSkill(skillId);
  return !!getModule(skill, moduleId);
};

module.exports = {
  skillsCatalog,
  getSkill,
  getModule,
  isValidSkillModule,
};
