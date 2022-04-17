export default async (analysisId) => {
  const res = await fetch(`http://d1pu8bxuwsqdvz.cloudfront.net/analyses/${analysisId}.json`, { credentials: 'include' });
  return res.json();
};
