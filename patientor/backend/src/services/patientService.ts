import patientData from '../../data/patients.ts';
import { randomUUID } from 'node:crypto';
import type { NewPatient, NonSensitivePatient, Patient } from '../types.ts';

const patients: Patient[] = patientData as Patient[];

export function getNonSensitivePatients(): NonSensitivePatient[] {
  return patients.map(({ id, name, dateOfBirth, gender, occupation }) => ({
    id, name, dateOfBirth, gender, occupation,
  }));
}

export function addPatient(newPatient: NewPatient): Patient {
  const patient: Patient = { id: randomUUID(), ...newPatient };
  patients.push(patient);
  return patient;
}
