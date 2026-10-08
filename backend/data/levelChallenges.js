const financialQuestions = [
  ['Which is a need?', 'A safe meal', ['A new game', 'A toy collection', 'A decorative lamp'], 'Needs are essential for health and safety.'],
  ['What is a good reason to save money?', 'To prepare for a planned goal', ['To spend without thinking', 'To avoid keeping any records', 'To lend every rupee immediately'], 'A savings goal helps you plan for a future need.'],
  ['A budget helps you...', 'Plan income and spending', ['Spend more than you have', 'Hide purchases', 'Ignore future expenses'], 'A budget compares money available with planned expenses.'],
  ['How can you compare two similar products?', 'Check price, quantity, and quality', ['Choose the brightest package', 'Ignore the labels', 'Buy the first one you see'], 'Comparing value means checking relevant facts.'],
  ['Before a large purchase, you should...', 'Compare options and check your budget', ['Buy immediately', 'Borrow without a plan', 'Ignore the total cost'], 'Planning prevents unmanageable spending.'],
  ['A bank account can help you...', 'Keep money securely and track it', ['Guarantee every investment earns money', 'Avoid all financial decisions', 'Share your PIN safely'], 'Accounts can help store and track money.'],
  ['Before approving a digital payment, you should...', 'Check recipient and amount', ['Share your PIN', 'Ignore the confirmation screen', 'Approve every request'], 'Always verify the recipient and transaction amount.'],
  ['An unexpected message asks for your payment PIN. What should you do?', 'Do not share it; verify through official channels', ['Send it quickly', 'Reply with your password too', 'Post it in a group chat'], 'Legitimate services do not need you to share your secret PIN.'],
  ['A purchase is outside your budget. What is the safest choice?', 'Pause and revise your plan', ['Use someone else’s account secretly', 'Ignore the cost', 'Borrow without checking repayment'], 'Pause to check affordability before making a purchase.'],
  ['What is a strong money-management habit?', 'Track spending, save, and review goals', ['Spend first and plan later', 'Share account codes with friends', 'Ignore account statements'], 'Regular tracking and saving support sound decisions.'],
];

const digitalQuestions = [
  ['Which device is used to type text into a computer?', 'Keyboard', ['Speaker', 'Webcam', 'Monitor'], 'A keyboard is an input device for typing.'],
  ['Which key creates a space between words?', 'Spacebar', ['Shift', 'Escape', 'Tab'], 'The spacebar inserts a space between words.'],
  ['Where should you keep related documents?', 'In a clearly named folder', ['In random folders', 'Only in the recycle bin', 'On an unknown public site'], 'Named folders make files easier to find.'],
  ['What does a web browser help you do?', 'Visit websites', ['Print money', 'Charge a laptop', 'Create a keyboard'], 'Browsers open and display websites.'],
  ['Which is safest on an unfamiliar website?', 'Check the address and avoid sharing private data', ['Enter your password everywhere', 'Download every pop-up', 'Disable all security warnings'], 'Check a site before sharing information or downloading files.'],
  ['Which email greeting is appropriate for a teacher?', 'Hello Ms. Lee,', ['hey u', 'no greeting needed', 'send me this now'], 'A polite greeting is appropriate in a school email.'],
  ['Which password is strongest?', 'A long unique passphrase', ['12345678', 'Your first name', 'The word password'], 'Long, unique passwords are harder to guess.'],
  ['A stranger asks for your home address in a game chat. What should you do?', 'Do not share it and tell a trusted adult', ['Send it privately', 'Post it publicly', 'Share a school login instead'], 'Keep personal information private and seek trusted help.'],
  ['You cannot find a saved file. What is a good first step?', 'Search by its name or file type', ['Delete unrelated folders', 'Share your password', 'Download a file recovery app from a pop-up'], 'Searching by name or type helps locate files safely.'],
  ['What is a good digital habit?', 'Protect accounts and think before sharing', ['Reuse one password everywhere', 'Click every unknown link', 'Post private information publicly'], 'Safe digital habits protect your information and devices.'],
];

const difficultyForLevel = (level) => {
  if (level === 1) return { label: 'Noob · Beginner', tier: 'Foundations' };
  if (level === 2) return { label: 'Medium · Intermediate', tier: 'Application' };
  return { label: 'Pro · Advanced', tier: 'Mastery' };
};

const makeQuestion = (id, question, correctOption, distractors, explanation, extras = {}) => {
  const options = [...new Set([String(correctOption), ...distractors.map(String)])];
  let fallback = 1;
  while (options.length < 4) {
    const candidate = `Alternative ${fallback}`;
    if (!options.includes(candidate)) options.push(candidate);
    fallback += 1;
  }
  const fourOptions = options.slice(0, 4);
  const correctIndex = (id - 1) % fourOptions.length;
  const correctValue = fourOptions[0];
  fourOptions[0] = fourOptions[correctIndex];
  fourOptions[correctIndex] = correctValue;

  return {
    id,
    question,
    options: fourOptions,
    correctAnswer: correctIndex,
    explanation,
    inputType: 'choice',
    ...extras,
  };
};

const makeSpeechQuestion = (id, level, topic) => {
  const stems = [
    'I practice speaking clearly',
    'Careful listening helps us learn',
    'Kind words build stronger friendships',
    'I can explain my ideas with confidence',
    'Good communication begins with respect',
    'Please help me understand this lesson',
    'We can solve problems by working together',
    'I listen carefully before I respond',
    'Sharing thoughtful ideas helps our team',
    'Clear speech makes instructions easier to follow',
  ];
  const targetText = `${stems[(id + level - 2) % stems.length]}${id % 2 ? '.' : ' today.'}`;
  const difficulty = difficultyForLevel(level).label;
  return makeQuestion(
    id,
    `${difficulty}: read this ${topic.toLowerCase()} sentence aloud: “${targetText}”`,
    'Speech matches the target sentence',
    ['Speech partially matches the target', 'Speech does not match the target', 'No speech was recognized'],
    'Clear pronunciation and correctly ordered target words improve the speech accuracy score.',
    { inputType: 'speech', targetText }
  );
};

const createCourseQuestion = (skill, level, id) => {
  const difficulty = difficultyForLevel(level);
  const variation = Math.floor((id - 1) / 5);
  if (skill.id === 'communication') return makeSpeechQuestion(id, level, skill.topics[level - 1]);

  if (skill.id === 'logical-reasoning') {
    const step = Math.max(2, level + variation);
    const start = 3 + (id % 7);
    const answer = start + step * 4;
    const a = Math.max(2, level + (id % 4));
    const b = level + 3 + variation;
    const mode = (id - 1) % 3;
    if (mode === 0) {
      return makeQuestion(
        id,
        `${difficulty.label}: continue the sequence ${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}, ?`,
        answer,
        [answer + 1, answer - step, answer + step * 2],
        `The sequence adds ${step} each time, so the next value is ${answer}.`
      );
    }
    if (mode === 1) {
      const result = a * b;
      return makeQuestion(
        id,
        `${difficulty.label}: each of ${b} groups contains ${a} clues. How many clues are there in all?`,
        result,
        [result + a, a + b, Math.max(1, result - b)],
        `${a} clues × ${b} groups = ${result}.`
      );
    }
    const even = (id + level) % 2 === 0;
    const value = even ? 8 + variation * 2 : 7 + variation * 2;
    const result = value + (value % 2 === 0 ? 1 : 2);
    return makeQuestion(
      id,
      `${difficulty.label}: a rule adds 1 to an even number and 2 to an odd number. What is the result for ${value}?`,
      result,
      [result + 1, result - 1, value],
      `${value} is ${even ? 'even' : 'odd'}, so the rule gives ${result}.`
    );
  }

  if (skill.id === 'coding') {
    const initial = level + 2 + variation;
    const runs = level === 1 ? 2 : level === 2 ? 3 + (id % 2) : 4 + (id % 3);
    const increment = level + 1 + (id % 3);
    const total = initial + runs * increment;
    const mode = (id - 1) % 3;
    if (mode === 0) {
      return makeQuestion(
        id,
        `${difficulty.label}: total starts at ${initial}; a loop adds ${increment} on each of ${runs} runs. What is the final total?`,
        total,
        [total - increment, initial + runs, total + increment],
        `The loop adds ${runs} × ${increment} = ${runs * increment}; add the starting value ${initial} to get ${total}.`
      );
    }
    if (mode === 1) {
      const value = level * 5 + id;
      const threshold = level * 4 + variation;
      const answer = value >= threshold ? 'Ready' : 'Practice';
      return makeQuestion(
        id,
        `${difficulty.label}: if score >= ${threshold}, display “Ready”; otherwise display “Practice”. What displays for score ${value}?`,
        answer,
        [answer === 'Ready' ? 'Practice' : 'Ready', 'Nothing', 'Repeat forever'],
        `${value} ${value >= threshold ? 'meets' : 'does not meet'} the threshold ${threshold}, so the result is ${answer}.`
      );
    }
    const values = [level + variation, level * 2 + id, level + id + 2];
    const answer = values.reduce((sum, value) => sum + value, 0);
    return makeQuestion(
      id,
      `${difficulty.label}: a function returns the sum of ${values.join(', ')}. What value does it return?`,
      answer,
      [answer + 1, answer - values[0], values[0] * values[1]],
      `${values.join(' + ')} = ${answer}; a function returns that computed value.`
    );
  }

  if (skill.id === 'abacus') {
    const a = level * 7 + 13 + variation;
    const b = level * 4 + 6 + (id % 4);
    const c = level + 3 + (id % 3);
    const mode = (id - 1) % 3;
    if (mode === 0) {
      return makeQuestion(
        id,
        `${difficulty.label}: calculate ${a} + ${b}.`,
        a + b,
        [a + b - 1, a + b + 10, a - b],
        `${a} + ${b} = ${a + b}.`
      );
    }
    if (mode === 1) {
      return makeQuestion(
        id,
        `${difficulty.label}: calculate (${a} + ${b}) - ${a}.`,
        b,
        [b + 1, b - 1, a],
        `First add ${a} + ${b}; subtracting ${a} leaves ${b}.`
      );
    }
    const answer = c * (level + 2) + b;
    return makeQuestion(
      id,
      `${difficulty.label}: calculate (${c} × ${level + 2}) + ${b}.`,
      answer,
      [answer - b, answer + c, c + level + 2],
      `Multiply first: ${c} × ${level + 2} = ${c * (level + 2)}; then add ${b} to get ${answer}.`
    );
  }

  const bank = skill.id === 'financial-literacy' ? financialQuestions : digitalQuestions;
  const [prompt, correct, distractors, explanation] = bank[(id + level - 2) % bank.length];
  const context =
    level === 1
      ? 'Choose the safest or most useful action.'
      : level === 2
        ? `Scenario ${variation + 1}: think through the practical consequences.`
        : `Pro challenge ${variation + 1}: consider safety, planning, and the longer-term impact.`;
  return makeQuestion(
    id,
    `${difficulty.label}: ${context} ${prompt}`,
    correct,
    distractors,
    explanation
  );
};

const generateChallenge = (skill, levelNumber) => {
  const level = Number(levelNumber);
  if (!Number.isInteger(level) || level < 1 || level > 10) {
    throw new RangeError('Level must be an integer from 1 to 10.');
  }
  const questionCount = level * 5;
  const difficulty = difficultyForLevel(level);
  return {
    skillId: skill.id,
    levelNumber: level,
    topic: skill.topics[level - 1],
    tier: difficulty.tier,
    difficulty: difficulty.label,
    questionCount,
    questions: Array.from({ length: questionCount }, (_, index) =>
      createCourseQuestion(skill, level, index + 1)
    ),
  };
};

const publicChallenge = (challenge) => ({
  ...challenge,
  questions: challenge.questions.map(({ correctAnswer, explanation, ...question }) => question),
});

const normalizeAnswer = (answer) =>
  String(answer ?? '')
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"“”‘’]/g, '')
    .replace(/\s+/g, ' ');

const evaluateSpeech = (targetText, transcript) => {
  const targetWords = normalizeAnswer(targetText).split(' ').filter(Boolean);
  const spokenWords = normalizeAnswer(transcript).split(' ').filter(Boolean);
  const dp = Array.from({ length: targetWords.length + 1 }, () =>
    Array(spokenWords.length + 1).fill(0)
  );
  for (let i = 1; i <= targetWords.length; i += 1) {
    for (let j = 1; j <= spokenWords.length; j += 1) {
      dp[i][j] =
        targetWords[i - 1] === spokenWords[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const matchedIndexes = new Set();
  let targetIndex = targetWords.length;
  let spokenIndex = spokenWords.length;
  while (targetIndex > 0 && spokenIndex > 0) {
    if (targetWords[targetIndex - 1] === spokenWords[spokenIndex - 1]) {
      matchedIndexes.add(targetIndex - 1);
      targetIndex -= 1;
      spokenIndex -= 1;
    } else if (dp[targetIndex - 1][spokenIndex] >= dp[targetIndex][spokenIndex - 1]) {
      targetIndex -= 1;
    } else {
      spokenIndex -= 1;
    }
  }
  const matches = matchedIndexes.size;
  return {
    accuracy: targetWords.length ? Math.round((matches / targetWords.length) * 100) : 0,
    words: targetWords.map((word, index) => ({
      word,
      matched: matchedIndexes.has(index),
    })),
  };
};

module.exports = {
  generateChallenge,
  publicChallenge,
  normalizeAnswer,
  evaluateSpeech,
};
