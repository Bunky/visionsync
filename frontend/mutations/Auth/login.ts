export default async (credentials) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(credentials),
});
