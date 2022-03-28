export default async (formData) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/upload`, {
  method: 'POST',
  credentials: 'include',
  body: formData
});
