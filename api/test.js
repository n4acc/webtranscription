module.exports = (req, res) => {
    console.log('Test API hit', req.method, req.url);
    res.status(200).json({ message: 'API is working' });
  };