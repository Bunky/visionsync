export default async (newAccount) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/signup`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newAccount),
});
