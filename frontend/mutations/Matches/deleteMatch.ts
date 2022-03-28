export default async (matchId) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, {
  method: 'DELETE',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(matchId)
});
