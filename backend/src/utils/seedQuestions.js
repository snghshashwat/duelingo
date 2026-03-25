const Question = require("../models/Question");

const questions = [
  // English to Italian
  {
    question: 'How do you say "Hello" in Italian?',
    correctAnswer: "Ciao",
    options: ["Ciao", "Hola", "Bonjour", "Hallo"],
    languageDirection: "EN_IT",
    difficulty: "easy",
  },
  {
    question: 'What is "Water" in Italian?',
    correctAnswer: "Acqua",
    options: ["Acqua", "Vino", "Pane", "Latte"],
    languageDirection: "EN_IT",
    difficulty: "easy",
  },
  {
    question: 'How do you say "Goodbye" in Italian?',
    correctAnswer: "Arrivederci",
    options: ["Arrivederci", "Adios", "Au revoir", "Auf Wiedersehen"],
    languageDirection: "EN_IT",
    difficulty: "easy",
  },
  {
    question: '"I love you" in Italian is?',
    correctAnswer: "Ti amo",
    options: ["Ti amo", "Je t'aime", "Ich liebe dich", "Te quiero"],
    languageDirection: "EN_IT",
    difficulty: "easy",
  },
  {
    question: 'What is "House" in Italian?',
    correctAnswer: "Casa",
    options: ["Casa", "Puerta", "Ventana", "Tetto"],
    languageDirection: "EN_IT",
    difficulty: "easy",
  },
  {
    question: '"Beautiful" in Italian is?',
    correctAnswer: "Bellissimo",
    options: ["Bellissimo", "Hermoso", "Beau", "Schön"],
    languageDirection: "EN_IT",
    difficulty: "medium",
  },
  {
    question: 'What is "Tomorrow" in Italian?',
    correctAnswer: "Domani",
    options: ["Domani", "Mañana", "Demain", "Morgen"],
    languageDirection: "EN_IT",
    difficulty: "medium",
  },
  {
    question: '"I don\'t understand" in Italian is?',
    correctAnswer: "Non capisco",
    options: [
      "Non capisco",
      "No entiendo",
      "Je ne comprends pas",
      "Ich verstehe nicht",
    ],
    languageDirection: "EN_IT",
    difficulty: "medium",
  },
  {
    question: 'What is "Happy" in Italian?',
    correctAnswer: "Felice",
    options: ["Felice", "Contento", "Alegre", "Glücklich"],
    languageDirection: "EN_IT",
    difficulty: "easy",
  },
  {
    question: '"Nice to meet you" in Italian is?',
    correctAnswer: "Piacere di conoscerti",
    options: ["Piacere di conoscerti", "Encantado", "Enchanté", "Freut mich"],
    languageDirection: "EN_IT",
    difficulty: "hard",
  },

  // Italian to English
  {
    question: '"Ciao" means?',
    correctAnswer: "Hello / Goodbye",
    options: ["Hello / Goodbye", "Good morning", "Good night", "How are you?"],
    languageDirection: "IT_EN",
    difficulty: "easy",
  },
  {
    question: '"Grazie" means?',
    correctAnswer: "Thank you",
    options: ["Thank you", "Please", "Excuse me", "Sorry"],
    languageDirection: "IT_EN",
    difficulty: "easy",
  },
  {
    question: '"Pane" means?',
    correctAnswer: "Bread",
    options: ["Bread", "Water", "Wine", "Cheese"],
    languageDirection: "IT_EN",
    difficulty: "easy",
  },
  {
    question: '"Amore" means?',
    correctAnswer: "Love",
    options: ["Love", "Friend", "Family", "Heart"],
    languageDirection: "IT_EN",
    difficulty: "easy",
  },
  {
    question: '"Sole" means?',
    correctAnswer: "Sun",
    options: ["Sun", "Moon", "Star", "Cloud"],
    languageDirection: "IT_EN",
    difficulty: "easy",
  },
  {
    question: '"Straniero" means?',
    correctAnswer: "Foreigner",
    options: ["Foreigner", "Friend", "Stranger", "Native"],
    languageDirection: "IT_EN",
    difficulty: "medium",
  },
  {
    question: '"Gelato" means?',
    correctAnswer: "Ice cream",
    options: ["Ice cream", "Dessert", "Cake", "Candy"],
    languageDirection: "IT_EN",
    difficulty: "easy",
  },
  {
    question: '"Scusa" means?',
    correctAnswer: "Excuse me / Sorry",
    options: ["Excuse me / Sorry", "Thank you", "Please", "Yes"],
    languageDirection: "IT_EN",
    difficulty: "easy",
  },
  {
    question: '"Bellissima" means?',
    correctAnswer: "Very beautiful",
    options: ["Very beautiful", "Pretty", "Handsome", "Ugly"],
    languageDirection: "IT_EN",
    difficulty: "medium",
  },
  {
    question: '"Silenzio" means?',
    correctAnswer: "Silence",
    options: ["Silence", "Noise", "Sound", "Echo"],
    languageDirection: "IT_EN",
    difficulty: "medium",
  },
];

const seedQuestions = async () => {
  try {
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log("✓ Questions seeded successfully");
  } catch (error) {
    console.error("Error seeding questions:", error);
  }
};

module.exports = seedQuestions;
