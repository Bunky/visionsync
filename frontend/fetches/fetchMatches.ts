export default async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, { credentials: 'include' });
  return res.json();
};
