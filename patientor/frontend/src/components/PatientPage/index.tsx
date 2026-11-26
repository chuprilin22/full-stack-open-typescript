import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Alert, Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import type { Diagnosis, Entry, NewEntry, Patient } from '../../types';
import { apiBaseUrl } from '../../constants';
import patientService from '../../services/patients';

const assertNever = (value: never): never => { throw new Error(`Unknown entry: ${JSON.stringify(value)}`); };

function EntryDetails({ entry, diagnoses }: { entry: Entry; diagnoses: Diagnosis[] }) {
  const diagnosisName = (code: string) => diagnoses.find(item => item.code === code)?.name ?? code;
  let extra;
  switch (entry.type) {
    case 'HealthCheck': extra = <p>Health rating: {entry.healthCheckRating}</p>; break;
    case 'Hospital': extra = <p>Discharged {entry.discharge.date}: {entry.discharge.criteria}</p>; break;
    case 'OccupationalHealthcare': extra = <p>Employer: {entry.employerName}{entry.sickLeave && ` · Sick leave ${entry.sickLeave.startDate}–${entry.sickLeave.endDate}`}</p>; break;
    default: return assertNever(entry);
  }
  return <Box sx={{ border: '1px solid #bbb', borderRadius: 1, p: 2, mb: 2 }}>
    <strong>{entry.date} · {entry.type}</strong>
    <p>{entry.description}</p>
    <p>Specialist: {entry.specialist}</p>
    {extra}
    {entry.diagnosisCodes?.length ? <ul>{entry.diagnosisCodes.map(code => <li key={code}>{code}: {diagnosisName(code)}</li>)}</ul> : null}
  </Box>;
}

type EntryType = Entry['type'];

const PatientPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient>();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [type, setType] = useState<EntryType>('HealthCheck');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [specialist, setSpecialist] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [healthRating, setHealthRating] = useState<0 | 1 | 2 | 3>(0);
  const [dischargeDate, setDischargeDate] = useState('');
  const [dischargeCriteria, setDischargeCriteria] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [sickStart, setSickStart] = useState('');
  const [sickEnd, setSickEnd] = useState('');

  useEffect(() => {
    if (!id) return;
    void patientService.getOne(id).then(setPatient).catch(() => setError('Could not load patient'));
    void axios.get<Diagnosis[]>(`${apiBaseUrl}/diagnoses`).then(response => setDiagnoses(response.data)).catch(() => setError('Could not load diagnoses'));
  }, [id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    const base = { date, description, specialist, diagnosisCodes: codes };
    let entry: NewEntry;
    switch (type) {
      case 'HealthCheck': entry = { ...base, type, healthCheckRating: healthRating }; break;
      case 'Hospital': entry = { ...base, type, discharge: { date: dischargeDate, criteria: dischargeCriteria } }; break;
      case 'OccupationalHealthcare': entry = { ...base, type, employerName, ...(sickStart && sickEnd ? { sickLeave: { startDate: sickStart, endDate: sickEnd } } : {}) }; break;
      default: return assertNever(type);
    }
    try {
      const created = await patientService.addEntry(id, entry);
      setPatient(current => current ? { ...current, entries: [...(current.entries ?? []), created] } : current);
      setFormOpen(false);
      setError('');
    } catch (caught: unknown) {
      if (axios.isAxiosError(caught)) {
        const body: unknown = caught.response?.data;
        setError(typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string' ? body.error : caught.message);
      } else setError('Could not add entry');
    }
  };

  if (!patient) return <p>{error || 'Loading patient...'}</p>;
  return <div>
    <Typography variant="h5" component="h1">{patient.name}</Typography>
    <p>{patient.ssn}</p><p>{patient.occupation}</p><p>{patient.gender} · {patient.dateOfBirth}</p>
    <Typography variant="h6">Entries</Typography>
    {(patient.entries ?? []).map(entry => <EntryDetails key={entry.id} entry={entry} diagnoses={diagnoses} />)}
    {error && <Alert severity="error">{error}</Alert>}
    {!formOpen && <Button onClick={() => setFormOpen(true)}>Add New Entry</Button>}
    {formOpen && <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2, maxWidth: 500, mt: 2 }}>
      <TextField select label="Type" value={type} onChange={event => setType(event.target.value as EntryType)}>
        <MenuItem value="HealthCheck">HealthCheck</MenuItem><MenuItem value="Hospital">Hospital</MenuItem><MenuItem value="OccupationalHealthcare">OccupationalHealthcare</MenuItem>
      </TextField>
      <TextField label="Date" type="date" value={date} onChange={event => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
      <TextField label="Description" value={description} onChange={event => setDescription(event.target.value)} required />
      <TextField label="Specialist" value={specialist} onChange={event => setSpecialist(event.target.value)} required />
      <TextField select label="Diagnosis codes" value={codes} onChange={event => setCodes(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value)} slotProps={{ select: { multiple: true } }}>
        {diagnoses.map(item => <MenuItem key={item.code} value={item.code}>{item.code} · {item.name}</MenuItem>)}
      </TextField>
      {type === 'HealthCheck' && <TextField select label="Health rating" value={healthRating} onChange={event => setHealthRating(Number(event.target.value) as 0 | 1 | 2 | 3)}>
        <MenuItem value={0}>Healthy</MenuItem><MenuItem value={1}>Low risk</MenuItem><MenuItem value={2}>High risk</MenuItem><MenuItem value={3}>Critical risk</MenuItem>
      </TextField>}
      {type === 'Hospital' && <><TextField label="Discharge date" type="date" value={dischargeDate} onChange={event => setDischargeDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required /><TextField label="Discharge criteria" value={dischargeCriteria} onChange={event => setDischargeCriteria(event.target.value)} required /></>}
      {type === 'OccupationalHealthcare' && <><TextField label="Employer name" value={employerName} onChange={event => setEmployerName(event.target.value)} required /><TextField label="Sick leave start" type="date" value={sickStart} onChange={event => setSickStart(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField label="Sick leave end" type="date" value={sickEnd} onChange={event => setSickEnd(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></>}
      <Button type="submit" variant="contained">Add</Button>
    </Box>}
  </div>;
};

export default PatientPage;
