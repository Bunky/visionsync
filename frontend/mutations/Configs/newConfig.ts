export default async (config) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/configs`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(config)
});
