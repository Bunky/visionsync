export default async (match) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${match.matchId}`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(match.changes)
});
