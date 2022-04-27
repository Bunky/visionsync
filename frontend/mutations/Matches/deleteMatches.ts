export default async (matchIds) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, {
  method: 'DELETE',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ matchIds })
});
