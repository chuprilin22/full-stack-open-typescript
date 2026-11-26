import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import diagnoses from '../data/diagnoses.ts';
import { addPatient, getNonSensitivePatients } from './services/patientService.ts';
import { Gender } from './types.ts';
import type { Diagnosis } from './types.ts';

const app = express();
app.use(cors());
app.use(express.json());

const diagnosisData: Diagnosis[] = diagnoses;
const newPatientSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ssn: z.string().min(1),
  gender: z.enum([Gender.Male, Gender.Female, Gender.Other]),
  occupation: z.string().min(1),
});

app.get('/api/ping', (_req, res) => {
  res.send('pong');
});

app.get('/api/diagnoses', (_req, res) => {
  res.json(diagnosisData);
});

app.get('/api/patients', (_req, res) => {
  res.json(getNonSensitivePatients());
});

app.post('/api/patients', (req, res) => {
  const body: unknown = req.body;
  const result = newPatientSchema.safeParse(body);
  if (!result.success) {
    return res.status(400).json({ error: 'Incorrect or missing data' });
  }
  return res.json(addPatient(result.data));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
