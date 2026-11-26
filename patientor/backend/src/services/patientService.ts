import patientData from '../../data/patients.ts';
import { randomUUID } from 'node:crypto';
import type { NewEntry, NewPatient, NonSensitivePatient, Patient, Entry } from '../types.ts';

const patients: Patient[] = patientData;

export function getNonSensitivePatients(): NonSensitivePatient[] {
  return patients.map(({ id, name, dateOfBirth, gender, occupation }) => ({
    id, name, dateOfBirth, gender, occupation,
  }));
}

export function addPatient(newPatient: NewPatient): Patient {
  const patient: Patient = { id: randomUUID(), ...newPatient, entries: [] };
  patients.push(patient);
  return patient;
}

export function getPatient(id: string): Patient | undefined { return patients.find(patient => patient.id === id); }

export function addEntry(id: string, newEntry: NewEntry): Entry | undefined {
  const patient = getPatient(id);
  if (!patient) return undefined;
  const entry = { ...newEntry, id: randomUUID() } as Entry;
  patient.entries.push(entry);
  return entry;
}
