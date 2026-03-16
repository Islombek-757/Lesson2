import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';
import Subject from '../models/Subject';
import Topic from '../models/Topic';
import Lesson from '../models/Lesson';
import Quiz from '../models/Quiz';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-os');

    await Promise.all([
      User.deleteMany({}),
      Subject.deleteMany({}),
      Topic.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({})
    ]);

    await User.create({
      name: 'Admin User',
      email: 'admin@schoolos.com',
      password: 'admin123',
      role: 'admin'
    });

    const teacher = await User.create({
      name: 'Prof. Thompson',
      email: 'teacher@schoolos.com',
      password: 'teacher123',
      role: 'teacher'
    });

    await User.create({
      name: 'Student Demo',
      email: 'student@schoolos.com',
      password: 'student123',
      role: 'student',
      xp: 450,
      level: 1,
      streak: 4
    });

    const [math, physics, english] = await Subject.insertMany([
      {
        title: 'Mathematics',
        slug: 'mathematics',
        description: 'Algebra, Geometry and Calculus fundamentals.',
        icon: '📐',
        color: '#6366f1',
        createdBy: teacher._id,
        order: 1
      },
      {
        title: 'Physics',
        slug: 'physics',
        description: 'Mechanics, Electricity and Motion.',
        icon: '⚡',
        color: '#f59e0b',
        createdBy: teacher._id,
        order: 2
      },
      {
        title: 'English',
        slug: 'english',
        description: 'Grammar, Vocabulary and Communication.',
        icon: '📝',
        color: '#10b981',
        createdBy: teacher._id,
        order: 3
      }
    ]);

    const [algebraTopic, geometryTopic, mechanicsTopic, electricityTopic, grammarTopic, vocabTopic] = await Topic.insertMany([
      {
        title: 'Algebra Basics',
        slug: 'algebra-basics',
        description: 'Linear expressions and equations',
        subject: math._id,
        createdBy: teacher._id,
        order: 1
      },
      {
        title: 'Geometry Foundations',
        slug: 'geometry-foundations',
        description: 'Angles, triangles and area',
        subject: math._id,
        createdBy: teacher._id,
        order: 2
      },
      {
        title: 'Mechanics',
        slug: 'mechanics',
        description: 'Motion, force, and Newton laws',
        subject: physics._id,
        createdBy: teacher._id,
        order: 1
      },
      {
        title: 'Electricity',
        slug: 'electricity',
        description: 'Current, voltage and resistance',
        subject: physics._id,
        createdBy: teacher._id,
        order: 2
      },
      {
        title: 'Grammar',
        slug: 'grammar',
        description: 'Sentence structure and tenses',
        subject: english._id,
        createdBy: teacher._id,
        order: 1
      },
      {
        title: 'Vocabulary',
        slug: 'vocabulary',
        description: 'Word meanings and usage',
        subject: english._id,
        createdBy: teacher._id,
        order: 2
      }
    ]);

    const lessons = await Lesson.insertMany([
      {
        title: 'Solving Linear Equations',
        slug: 'solving-linear-equations-demo',
        description: 'Master one-variable linear equations with a clear framework, common mistakes, and real-world examples.',
        content:
          `A linear equation has a variable with power 1, and its graph is a straight line. In this lesson, we focus on solving one-variable forms such as 2x + 5 = 17.

Step-by-step method:
1) Simplify both sides if needed (remove brackets, combine like terms).
2) Move constants to one side and variable terms to the other.
3) Isolate the variable by dividing or multiplying.
4) Check your answer by substitution.

Example:
2x + 5 = 17
2x = 12
x = 6
Check: 2(6) + 5 = 17, correct.

Common errors to avoid:
- Forgetting to apply the same operation to both sides.
- Sign mistakes when moving terms across the equal sign.
- Stopping before full simplification.

Real-world use case:
If a taxi fare is base_fee + rate * distance, solving linear equations helps find unknown distance or rate quickly.`,
        subject: math._id,
        topic: algebraTopic._id,
        tags: ['algebra', 'equations', 'beginner'],
        difficulty: 'beginner',
        duration: 15,
        xpReward: 50,
        isPublished: true,
        createdBy: teacher._id,
        order: 1
      },
      {
        title: 'Inequalities and Number Lines',
        slug: 'inequalities-number-lines',
        description: 'Understand inequality symbols, interval notation, and graph solution sets confidently on number lines.',
        content:
          `Inequalities compare values instead of forcing exact equality. You will work with <, >, <=, and >= and represent solutions visually.

Key ideas:
- x > 3 means values strictly greater than 3.
- x >= 3 includes 3 and all larger values.
- Compound inequalities can define ranges, like 2 < x <= 7.

Critical rule:
When multiplying or dividing both sides by a negative number, reverse the inequality sign.
Example: -2x > 8 => x < -4.

Number line strategy:
- Use an open circle for strict inequalities (< or >).
- Use a closed circle for inclusive inequalities (<= or >=).
- Shade left for smaller values, right for larger values.

Why this matters:
Inequalities are used in budgeting, safety limits, grading boundaries, and optimization problems where ranges are more useful than single values.`,
        subject: math._id,
        topic: algebraTopic._id,
        tags: ['algebra', 'inequalities'],
        difficulty: 'beginner',
        duration: 18,
        xpReward: 60,
        isPublished: true,
        createdBy: teacher._id,
        order: 2
      },
      {
        title: 'Triangles and Angle Sum Rule',
        slug: 'triangles-angle-sum-rule',
        description: 'Use the 180-degree rule, classify triangles, and solve missing-angle problems with confidence.',
        content:
          `Every triangle has one powerful property: the sum of interior angles is 180 degrees. This simple idea helps solve many geometry tasks.

Core skills in this lesson:
1) Find unknown interior angles quickly.
2) Use exterior angle relationships.
3) Classify triangles by sides (equilateral, isosceles, scalene) and by angles (acute, right, obtuse).

Example:
If two angles are 45 degrees and 65 degrees, the third angle is:
180 - (45 + 65) = 70 degrees.

Extension idea:
An exterior angle equals the sum of the two non-adjacent interior angles. This shortcut is useful in proofs and exam-style questions.

Application:
Triangle geometry is used in architecture, bridge design, computer graphics, and navigation.`,
        subject: math._id,
        topic: geometryTopic._id,
        tags: ['geometry', 'triangles'],
        difficulty: 'beginner',
        duration: 20,
        xpReward: 60,
        isPublished: true,
        createdBy: teacher._id,
        order: 3
      },
      {
        title: 'Newton First and Second Laws',
        slug: 'newton-first-second-laws',
        description: 'Build intuition for inertia and force with practical examples around Newton first and second laws.',
        content:
          `Newton's First Law states that an object remains at rest or in uniform motion unless acted on by a net external force. This resistance to change is called inertia.

Newton's Second Law links force, mass, and acceleration:
F = m * a

Interpretation:
- For fixed mass, larger force gives larger acceleration.
- For fixed force, larger mass gives smaller acceleration.

Practical examples:
- Seat belts protect passengers because your body tends to keep moving when the car stops suddenly.
- Pushing an empty cart accelerates faster than pushing a full cart with the same force.

Problem-solving workflow:
1) Draw all forces (weight, normal, friction, applied force).
2) Choose a positive direction.
3) Write net force equation.
4) Solve for unknown quantity and check units (N, kg, m/s^2).`,
        subject: physics._id,
        topic: mechanicsTopic._id,
        tags: ['physics', 'newton', 'force'],
        difficulty: 'beginner',
        duration: 22,
        xpReward: 70,
        isPublished: true,
        createdBy: teacher._id,
        order: 1
      },
      {
        title: 'Speed, Velocity and Acceleration',
        slug: 'speed-velocity-acceleration',
        description: 'Differentiate scalar and vector motion quantities and calculate them using consistent SI units.',
        content:
          `Motion analysis starts with three quantities: speed, velocity, and acceleration.

Definitions:
- Speed: distance / time (scalar, no direction).
- Velocity: displacement / time (vector, includes direction).
- Acceleration: change in velocity / time.

Units:
- Speed and velocity: m/s
- Acceleration: m/s^2

Example:
A cyclist moves 120 m east in 20 s.
Speed = 120/20 = 6 m/s.
Velocity = 6 m/s east.
If velocity changes from 6 to 10 m/s in 2 s, acceleration = (10 - 6)/2 = 2 m/s^2.

Common confusion:
An object can have constant speed but changing velocity if direction changes (e.g., circular motion).`,
        subject: physics._id,
        topic: mechanicsTopic._id,
        tags: ['physics', 'motion'],
        difficulty: 'beginner',
        duration: 18,
        xpReward: 60,
        isPublished: true,
        createdBy: teacher._id,
        order: 2
      },
      {
        title: 'Ohm Law and Simple Circuits',
        slug: 'ohm-law-simple-circuits',
        description: 'Apply V = I * R in series and parallel circuits to solve current, voltage, and resistance questions.',
        content:
          `Ohm's Law is the foundation of basic electrical analysis:
V = I * R
where V is voltage (volts), I is current (amperes), and R is resistance (ohms).

Series circuits:
- Current is the same through all components.
- Total resistance is the sum of individual resistances.

Parallel circuits:
- Voltage is the same across branches.
- Equivalent resistance is less than the smallest branch resistance.

Example:
If V = 12V and R = 4 ohm, then I = V/R = 3A.

Safety note:
Always reason about realistic current values; unexpectedly high current often indicates very low resistance and potential overheating risk.

Where used:
Phone chargers, LED strips, home wiring, robotics kits, and sensor circuits all rely on these principles.`,
        subject: physics._id,
        topic: electricityTopic._id,
        tags: ['physics', 'electricity', 'circuits'],
        difficulty: 'intermediate',
        duration: 25,
        xpReward: 80,
        isPublished: true,
        createdBy: teacher._id,
        order: 3
      },
      {
        title: 'Parts of Speech in English',
        slug: 'parts-of-speech-english',
        description: 'Learn all major parts of speech and identify their function in real sentence patterns.',
        content:
          `Strong grammar starts with understanding parts of speech.

Main categories:
- Noun: person, place, thing, idea.
- Verb: action or state.
- Adjective: describes a noun.
- Adverb: modifies a verb, adjective, or another adverb.
- Pronoun: replaces a noun.
- Preposition: shows relation (in, on, at, under).
- Conjunction: joins words or clauses.
- Interjection: short emotional expression.

Sentence analysis example:
"The diligent student quickly solved the difficult problem."
- student (noun), solved (verb), diligent/difficult (adjectives), quickly (adverb).

Skill focus:
When you can identify word roles, you write clearer sentences and avoid common grammar errors in exams and essays.`,
        subject: english._id,
        topic: grammarTopic._id,
        tags: ['english', 'grammar'],
        difficulty: 'beginner',
        duration: 16,
        xpReward: 50,
        isPublished: true,
        createdBy: teacher._id,
        order: 1
      },
      {
        title: 'Present Simple vs Present Continuous',
        slug: 'present-simple-vs-continuous',
        description: 'Choose the right present tense by reading context clues, time signals, and sentence intent.',
        content:
          `Present Simple and Present Continuous are both present tenses, but they serve different purposes.

Present Simple:
- Habits and routines: "She studies every evening."
- Facts: "Water boils at 100C."
- Timetables: "The train leaves at 8 AM."

Present Continuous:
- Action happening now: "She is studying right now."
- Temporary situation: "I am staying with my aunt this week."
- Changing trends: "Online learning is growing quickly."

Signal words:
- Simple: always, usually, often, every day.
- Continuous: now, currently, at the moment.

Tip:
Ask yourself: is this a regular pattern or a current/temporary action?`,
        subject: english._id,
        topic: grammarTopic._id,
        tags: ['english', 'tenses'],
        difficulty: 'beginner',
        duration: 19,
        xpReward: 60,
        isPublished: true,
        createdBy: teacher._id,
        order: 2
      },
      {
        title: 'Academic Vocabulary Building',
        slug: 'academic-vocabulary-building',
        description: 'Build durable academic vocabulary with context-driven practice, collocations, and spaced revision.',
        content:
          `Academic vocabulary helps you understand textbooks and write more precise essays.

How to learn efficiently:
1) Learn words in context, not as isolated translations.
2) Track collocations (common word pairs), e.g., "conduct research", "draw a conclusion".
3) Build word families: analyze, analysis, analytical.
4) Review with spaced repetition to move words into long-term memory.

Practice model:
- Read a short paragraph.
- Highlight unfamiliar academic words.
- Write your own sentence for each.
- Revisit after 1 day, 3 days, and 7 days.

Outcome:
You will read faster, write more formally, and communicate ideas with greater precision in school and university tasks.`,
        subject: english._id,
        topic: vocabTopic._id,
        tags: ['english', 'vocabulary', 'academic'],
        difficulty: 'intermediate',
        duration: 21,
        xpReward: 70,
        isPublished: true,
        createdBy: teacher._id,
        order: 3
      }
    ]);

    const getLesson = (slug: string) => lessons.find((l) => l.slug === slug)!;

    await Quiz.insertMany([
      {
        title: 'Linear Equations Quick Quiz',
        lesson: getLesson('solving-linear-equations-demo')._id,
        subject: math._id,
        timeLimit: 600,
        passingScore: 70,
        maxAttempts: 3,
        isPublished: true,
        xpReward: 100,
        createdBy: teacher._id,
        questions: [
          {
            question: 'Solve: 3x + 6 = 15',
            options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
            correctAnswer: 1,
            explanation: '3x = 9, so x = 3.',
            points: 10
          },
          {
            question: 'Solve: x - 7 = 5',
            options: ['x = 10', 'x = 11', 'x = 12', 'x = 13'],
            correctAnswer: 2,
            explanation: 'Add 7 to both sides: x = 12.',
            points: 10
          }
        ]
      },
      {
        title: 'Newton Laws Checkpoint',
        lesson: getLesson('newton-first-second-laws')._id,
        subject: physics._id,
        timeLimit: 540,
        passingScore: 70,
        maxAttempts: 3,
        isPublished: true,
        xpReward: 100,
        createdBy: teacher._id,
        questions: [
          {
            question: 'Newton second law formula is:',
            options: ['F = m * a', 'F = m / a', 'F = a / m', 'F = m + a'],
            correctAnswer: 0,
            explanation: 'Force equals mass multiplied by acceleration.',
            points: 10
          },
          {
            question: 'Inertia is best described as:',
            options: ['Change in speed', 'Resistance to change in motion', 'Amount of force', 'Rate of acceleration'],
            correctAnswer: 1,
            explanation: 'Inertia is resistance to changes in motion.',
            points: 10
          }
        ]
      },
      {
        title: 'English Grammar Basics Quiz',
        lesson: getLesson('parts-of-speech-english')._id,
        subject: english._id,
        timeLimit: 480,
        passingScore: 70,
        maxAttempts: 3,
        isPublished: true,
        xpReward: 90,
        createdBy: teacher._id,
        questions: [
          {
            question: 'Which word is a verb in: "She runs daily"?',
            options: ['She', 'runs', 'daily', 'none'],
            correctAnswer: 1,
            explanation: 'Runs is the action.',
            points: 10
          },
          {
            question: 'Choose the present continuous sentence:',
            options: ['I play football every day.', 'I am playing football now.', 'I played football yesterday.', 'I have played football.'],
            correctAnswer: 1,
            explanation: 'Present continuous uses am/is/are + verb-ing for current action.',
            points: 10
          }
        ]
      }
    ]);

    console.log('✅ Database seeded successfully');
    console.log('📚 Subjects: 3');
    console.log('🧠 Topics: 6');
    console.log('📖 Lessons: 9');
    console.log('📝 Quizzes: 3');
    console.log('👤 Admin: admin@schoolos.com / admin123');
    console.log('👨‍🏫 Teacher: teacher@schoolos.com / teacher123');
    console.log('🎓 Student: student@schoolos.com / student123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
