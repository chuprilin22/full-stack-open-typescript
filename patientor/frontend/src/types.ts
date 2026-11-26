export interface Diagnosis {
  code: string;
  name: string;
  latin?: string;
}

export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other"
}

export interface Patient {
  id: string;
  name: string;
  occupation: string;
  gender: Gender;
  ssn?: string;
  dateOfBirth?: string;
  entries?: Entry[];
}

export type PatientFormValues = Omit<Patient, "id" | "entries">;

interface BaseEntry { id: string; description: string; date: string; specialist: string; diagnosisCodes?: Diagnosis['code'][] }
export interface HealthCheckEntry extends BaseEntry { type: 'HealthCheck'; healthCheckRating: 0 | 1 | 2 | 3 }
export interface HospitalEntry extends BaseEntry { type: 'Hospital'; discharge: { date: string; criteria: string } }
export interface OccupationalHealthcareEntry extends BaseEntry { type: 'OccupationalHealthcare'; employerName: string; sickLeave?: { startDate: string; endDate: string } }
export type Entry = HealthCheckEntry | HospitalEntry | OccupationalHealthcareEntry;
export type NewEntry = Entry extends infer E ? E extends Entry ? Omit<E, 'id'> : never : never;
