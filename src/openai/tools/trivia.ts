import { zodFunction } from 'openai/helpers/zod';
import { z } from 'zod';

async function fetchTriviaQuestion(difficulty: string) {
  const url = `https://opentdb.com/api.php?amount=1&category=9&difficulty=${difficulty}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch trivia question');
  }
  const data = await response.json();
  return data.results[0];
}

const TriviaParameters = z.object({
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('Difficulty level of the trivia question'),
});

export const trivia = zodFunction({
  name: 'trivia',
  description: 'Get a trivia question based on the difficulty level.',
  parameters: TriviaParameters,
  function: async ({ difficulty }) => {
    const triviaQuestion = await fetchTriviaQuestion(difficulty);
    return JSON.stringify({
      question: triviaQuestion.question,
      correct_answer: triviaQuestion.correct_answer,
    });
  },
});
