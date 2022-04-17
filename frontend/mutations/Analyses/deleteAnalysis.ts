export default async (analysisId) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis`, {
  method: 'DELETE',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(analysisId)
});
