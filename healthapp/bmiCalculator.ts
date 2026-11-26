export function calculateBmi(height: number, weight: number): string {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  if (bmi < 16) return 'Underweight (Severe thinness)';
  if (bmi < 17) return 'Underweight (Moderate thinness)';
  if (bmi < 18.5) return 'Underweight (Mild thinness)';
  if (bmi < 25) return 'Normal range';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obese (Class I)';
  if (bmi < 40) return 'Obese (Class II)';
  return 'Obese (Class III)';
}

if (process.argv[1] === import.meta.filename) {
  try {
    const height = Number(process.argv[2]);
    const weight = Number(process.argv[3]);

    if (process.argv.length !== 4 || !Number.isFinite(height) || !Number.isFinite(weight) || height <= 0 || weight <= 0) {
      throw new Error('Give height and weight as positive numbers');
    }

    console.log(calculateBmi(height, weight));
  } catch (error: unknown) {
    if (error instanceof Error) console.log(error.message);
  }
}
