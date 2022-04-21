export default async (configId) => {
  const res = await fetch(`http://d1pu8bxuwsqdvz.cloudfront.net/configs/${configId}.json`, { credentials: 'include' });
  return res.json();
};
