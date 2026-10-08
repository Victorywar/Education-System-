const courseDefinitions = [
  {
    id: 'logical-reasoning',
    name: 'Logical Reasoning & Aptitude',
    shortDescription: 'Solve patterns, aptitude puzzles, and critical-thinking challenges.',
    description: 'Build strong reasoning habits through progressively challenging puzzles and practical aptitude tasks.',
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
    shortDescription: 'Learn algorithms, programming logic, debugging, and problem-solving.',
    description: 'Develop computational thinking by breaking problems into instructions and testing solutions.',
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
    shortDescription: 'Practice clear pronunciation, vocabulary, and confident conversations.',
    description: 'Practice spoken English through listening, pronunciation, sentence reading, and everyday conversation.',
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
    shortDescription: 'Build number sense, rapid calculation, and mental arithmetic.',
    description: 'Strengthen calculation fluency through number representation and progressive mental-math drills.',
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
    shortDescription: 'Learn saving, budgeting, digital payments, and scam prevention.',
    description: 'Make informed everyday money decisions and keep personal financial information safe.',
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
    shortDescription: 'Build safe and confident computer, internet, typing, and email skills.',
    description: 'Learn practical computer skills and safe habits for navigating the digital world.',
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

const tierForLevel = (level) =>
  level === 1
    ? 'Noob · Beginner'
    : level === 2
      ? 'Medium · Intermediate'
      : 'Pro · Advanced';

export const skills = courseDefinitions.map((course) => ({
  ...course,
  modules: course.topics.map((topic, index) => {
    const levelNumber = index + 1;
    const tier = tierForLevel(levelNumber);
    return {
      id: `${course.id}-${levelNumber}`,
      levelNumber,
      questionCount: levelNumber * 5,
      difficulty: tierForLevel(levelNumber),
      title: `Level ${levelNumber}: ${topic}`,
      description: `${tier} — learn and practice ${topic.toLowerCase()} through an interactive challenge.`,
      content: `Level ${levelNumber} · ${tier}\n\nFocus: ${topic}.\n\nReview the concept, then complete the interactive challenge. Your answers are checked as you go. Pass with at least 70% accuracy to unlock the next level.`,
      keyPoints: [
        `Build confidence with ${topic.toLowerCase()}.`,
        levelNumber <= 3
          ? 'Use the foundations to understand each question.'
          : levelNumber <= 7
            ? 'Apply what you know across multiple steps.'
            : 'Use careful reasoning in advanced mastery scenarios.',
        'Review the feedback after every response.',
        'Pass the level challenge with 70% or higher to continue.',
      ],
    };
  }),
}));

export const skillNameToId = {
  Abacus: 'abacus',
  'Abacus & Mental Math': 'abacus',
  Coding: 'coding',
  'Coding & Computational Thinking': 'coding',
  'Communication Skills': 'communication',
  'Communication & Spoken English': 'communication',
  'Logical Reasoning': 'logical-reasoning',
  'Logical Reasoning & Aptitude': 'logical-reasoning',
  'Financial Literacy': 'financial-literacy',
  'Digital & Computer Literacy': 'digital-literacy',
};

export const getSkillById = (skillId) => skills.find((skill) => skill.id === skillId) || null;

export const getModuleById = (skill, moduleId) =>
  skill?.modules?.find((module) => module.id === moduleId) || null;

export const getModuleIndex = (skill, moduleId) =>
  skill?.modules?.findIndex((module) => module.id === moduleId) ?? -1;
