export default async (matchId) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}`, {
  method: 'DELETE',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
});
