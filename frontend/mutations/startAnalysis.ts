export default async (matchId) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis/start`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ matchId })
});
