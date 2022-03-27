export default async () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis/stop`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
});
