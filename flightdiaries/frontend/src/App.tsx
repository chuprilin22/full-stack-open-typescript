import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

type Weather = 'sunny' | 'rainy' | 'cloudy' | 'stormy' | 'windy';
type Visibility = 'great' | 'good' | 'ok' | 'poor';

interface DiaryEntry {
  id: number;
  date: string;
  weather: Weather;
  visibility: Visibility;
}

const weatherOptions: Weather[] = ['sunny', 'rainy', 'cloudy', 'stormy', 'windy'];
const visibilityOptions: Visibility[] = ['great', 'good', 'ok', 'poor'];

const readError = async (response: Response): Promise<string> => {
  const body: unknown = await response.json();
  if (typeof body === 'object' && body !== null && 'error' in body) {
    if (typeof body.error === 'string') return body.error;
    if (Array.isArray(body.error)) {
      const messages = body.error.map((issue: unknown) => {
        if (typeof issue === 'object' && issue !== null && 'message' in issue && typeof issue.message === 'string') {
          return issue.message;
        }
        return 'Invalid entry';
      });
      return messages.join(', ');
    }
  }
  return `Request failed (${response.status})`;
};

const App = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [date, setDate] = useState('');
  const [weather, setWeather] = useState<Weather>('sunny');
  const [visibility, setVisibility] = useState<Visibility>('great');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/diaries')
      .then(response => response.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setEntries(data as DiaryEntry[]);
      })
      .catch(() => setError('Could not load diary entries'));
  }, []);

  const addEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/diaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, weather, visibility, comment }),
      });
      if (!response.ok) {
        setError(await readError(response));
        return;
      }
      const newEntry = await response.json() as DiaryEntry;
      setEntries([...entries, newEntry]);
      setDate('');
      setComment('');
    } catch {
      setError('Could not save diary entry');
    }
  };

  return (
    <main>
      <h1>Flight diaries</h1>
      <h2>Add an entry</h2>
      {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={event => { void addEntry(event); }}>
        <p><label>Date <input type="date" value={date} onChange={event => setDate(event.target.value)} required /></label></p>
        <fieldset>
          <legend>Weather</legend>
          {weatherOptions.map(option => <label key={option}><input type="radio" name="weather" checked={weather === option} onChange={() => setWeather(option)} />{option} </label>)}
        </fieldset>
        <fieldset>
          <legend>Visibility</legend>
          {visibilityOptions.map(option => <label key={option}><input type="radio" name="visibility" checked={visibility === option} onChange={() => setVisibility(option)} />{option} </label>)}
        </fieldset>
        <p><label>Comment <input value={comment} onChange={event => setComment(event.target.value)} /></label></p>
        <button type="submit">Add</button>
      </form>
      <h2>Entries</h2>
      {entries.map(entry => <div key={entry.id}><strong>{entry.date}</strong> — {entry.weather}, {entry.visibility}</div>)}
    </main>
  );
};

export default App;
