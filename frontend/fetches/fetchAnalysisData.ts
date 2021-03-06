export default async (analysisId) => {
  const res = await fetch(`https://d1pu8bxuwsqdvz.cloudfront.net/analyses/${analysisId}.json`, { credentials: 'include' });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};
