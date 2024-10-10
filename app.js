const express = require('express');
const mongoose = require('mongoose');
const cryptoRoutes = require('./route.js');  // Import the routes
const { fetchCryptoData } = require('./controller.js');
const cron = require('node-cron');  // Import node-cron for scheduling

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:admin1234@cluster0.axacm.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Middleware
app.use(express.json());

// Use the routes
app.use('/api', cryptoRoutes);

// Schedule the fetchCryptoData function to run every 24 hours
cron.schedule('0 0 * * *', async () => {
  console.log('Running fetchCryptoData job...');
  await fetchCryptoData();
  console.log('Completed fetchCryptoData job.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
