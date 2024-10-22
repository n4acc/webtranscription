module.exports = (req, res) => {
  console.log('Test API hit');
  res.status(200).json({ message: 'API is working' });
};
