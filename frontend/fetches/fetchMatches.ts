export default async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, { credentials: 'include' });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};
