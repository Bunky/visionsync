export default async () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis/start`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
});
