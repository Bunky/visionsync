export default async (configIds) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/configs`, {
  method: 'DELETE',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ configIds })
});
