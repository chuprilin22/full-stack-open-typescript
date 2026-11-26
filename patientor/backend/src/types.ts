export interface Diagnosis {
  code: string;
  name: string;
  latin?: string;
}

export const Gender = {
  Male: 'male',
  Female: 'female',
  Other: 'other',
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  ssn: string;
  gender: Gender;
  occupation: string;
  entries: Entry[];
}

export interface BaseEntry { id: string; description: string; date: string; specialist: string; diagnosisCodes?: Diagnosis['code'][] }
export const HealthCheckRating = { Healthy: 0, LowRisk: 1, HighRisk: 2, CriticalRisk: 3 } as const;
export type HealthCheckRating = typeof HealthCheckRating[keyof typeof HealthCheckRating];
export interface HealthCheckEntry extends BaseEntry { type: 'HealthCheck'; healthCheckRating: HealthCheckRating }
export interface HospitalEntry extends BaseEntry { type: 'Hospital'; discharge: { date: string; criteria: string } }
export interface OccupationalHealthcareEntry extends BaseEntry { type: 'OccupationalHealthcare'; employerName: string; sickLeave?: { startDate: string; endDate: string } }
export type Entry = HealthCheckEntry | HospitalEntry | OccupationalHealthcareEntry;
export type NewEntry = Entry extends infer E ? E extends Entry ? Omit<E, 'id'> : never : never;
export type NewPatient = Omit<Patient, 'id' | 'entries'>;
export type NonSensitivePatient = Omit<Patient, 'ssn' | 'entries'>;
