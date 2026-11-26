interface ExerciseResult {
  periodLength: number;
  trainingDays: number;
  success: boolean;
  rating: 1 | 2 | 3;
  ratingDescription: string;
  target: number;
  average: number;
}

export function calculateExercises(dailyHours: number[], target: number): ExerciseResult {
  let totalHours = 0;
  let trainingDays = 0;

  for (const hours of dailyHours) {
    totalHours += hours;
    if (hours > 0) {
      trainingDays++;
    }
  }

  const average = totalHours / dailyHours.length;
  const success = average >= target;
  let rating: 1 | 2 | 3 = 1;
  let ratingDescription = 'bad';

  if (success) {
    rating = 3;
    ratingDescription = 'great job';
  } else if (average >= target / 2) {
    rating = 2;
    ratingDescription = 'not too bad but could be better';
  }

  return {
    periodLength: dailyHours.length,
    trainingDays,
    success,
    rating,
    ratingDescription,
    target,
    average
  };
}

if (process.argv[1] === import.meta.filename) {
  try {
    const numbers = process.argv.slice(2).map(Number);
    if (numbers.length < 2 || numbers.some(value => !Number.isFinite(value)) || numbers[0] <= 0 || numbers.slice(1).some(value => value < 0)) {
      throw new Error('Give a target and daily exercise hours as numbers');
    }
    console.log(calculateExercises(numbers.slice(1), numbers[0]));
  } catch (error: unknown) {
    if (error instanceof Error) console.log(error.message);
  }
}
