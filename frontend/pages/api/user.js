const handler = (req, res) => {
  if (req.method === 'POST') {
    // Process a POST request
  } else if (req.method === 'GET') {
    return res.status(200).json({ name: 'John Dude' });
  } else {
    // Process another request
  }
};

export default handler;
