export default async () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/logout`, {
  method: 'GET',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
  }
});
