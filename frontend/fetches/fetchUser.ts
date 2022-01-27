export default async () => {
  const res = await fetch('/api/user', { credentials: 'include' });
  return res.json();
};
