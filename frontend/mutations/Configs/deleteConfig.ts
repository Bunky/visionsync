export default async (configId) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/configs/${configId}`, {
  method: 'DELETE',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
});
