import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import diagnoses from '../data/diagnoses.ts';
import { addEntry, addPatient, getNonSensitivePatients, getPatient } from './services/patientService.ts';
import { Gender } from './types.ts';
import type { Diagnosis, NewEntry } from './types.ts';

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
const date = z.iso.date();
const entryBase = z.object({
  description: z.string().min(1), date, specialist: z.string().min(1),
  diagnosisCodes: z.array(z.string()).optional(),
});
const newEntrySchema = z.discriminatedUnion('type', [
  entryBase.extend({ type: z.literal('HealthCheck'), healthCheckRating: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]) }),
  entryBase.extend({ type: z.literal('Hospital'), discharge: z.object({ date, criteria: z.string().min(1) }) }),
  entryBase.extend({ type: z.literal('OccupationalHealthcare'), employerName: z.string().min(1), sickLeave: z.object({ startDate: date, endDate: date }).optional() }),
]);

app.get('/api/ping', (_req, res) => {
  res.send('pong');
});

app.get('/api/diagnoses', (_req, res) => {
  res.json(diagnosisData);
});

app.get('/api/patients', (_req, res) => {
  res.json(getNonSensitivePatients());
});

app.get('/api/patients/:id', (req, res) => {
  const patient = getPatient(String(req.params.id));
  return patient ? res.json(patient) : res.status(404).json({ error: 'Patient not found' });
});

app.post('/api/patients/:id/entries', (req, res) => {
  const result = newEntrySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ') });
  const entry = addEntry(String(req.params.id), result.data as NewEntry);
  return entry ? res.json(entry) : res.status(404).json({ error: 'Patient not found' });
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
