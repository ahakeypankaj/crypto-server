const axios = require('axios');
const Crypto = require('./model');

// Fetch cryptocurrency data from CoinGecko and store it in the database
const fetchCryptoData = async () => {
  const coins = ['bitcoin', 'matic-network', 'ethereum'];
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`
    );
    
    for (const coin of coins) {
      const data = response.data[coin];
      const newEntry = new Crypto({
        coin,
        price: data.usd,
        marketCap: data.usd_market_cap,
        '24hChange': data.usd_24h_change,
      });
      await newEntry.save();
    }
  } catch (error) {
    console.error('Error fetching crypto data:', error);
  }
};


// // Fetch cryptocurrency data from CoinGecko and store it in the database
// const fetchCryptoData = async () => {
//     const coins = ['bitcoin', 'matic-network', 'ethereum'];
//     try {
//       // Log message to indicate API fetch has started
//       console.log('Fetching cryptocurrency data from CoinGecko...');
  
//       const response = await axios.get(
//         `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_market_cap=true`
//       );
  
//       // Log the API response for debugging purposes
//       console.log('API response:', response.data);
  
//       for (const coin of coins) {
//         const data = response.data[coin];
  
//         // Create a new entry in the database without the 24h change
//         const newEntry = new Crypto({
//           coin,
//           price: data.usd,
//           marketCap: data.usd_market_cap,
//           '24hChange': data.usd_24h_change,
//         });
  
//         // Save the new entry and log a success message
//         await newEntry.save();
//         console.log(`Saved data for ${coin}: Price = ${data.usd}, Market Cap = ${data.usd_market_cap}`);
//       }
  
//       console.log('Successfully fetched and stored cryptocurrency data.');
//     } catch (error) {
//       // Log the error if API fetch fails
//       console.error('Error fetching crypto data:', error);
//     }
//   };

// Get the latest stats for a specific cryptocurrency
const getStats = async (req, res) => {
  const { coin } = req.query;
  if (!coin) return res.status(400).json({ error: 'Coin query param is required' });

  try {
    const latestData = await Crypto.findOne({ coin }).sort({ timestamp: -1 });
    if (!latestData) {
      return res.status(404).json({ error: 'No data found for the requested coin' });
    }
    res.json({
      price: latestData.price,
      marketCap: latestData.marketCap,
      '24hChange': latestData['24hChange'],
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Calculate standard deviation of prices for the last 100 records of a cryptocurrency
const calculateStandardDeviation = (prices) => {
  const mean = prices.reduce((acc, curr) => acc + curr, 0) / prices.length;
  const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((acc, curr) => acc + curr, 0) / prices.length;
  return Math.sqrt(avgSquaredDiff);
};

const getDeviation = async (req, res) => {
  const { coin } = req.query;
  if (!coin) return res.status(400).json({ error: 'Coin query param is required' });

  try {
    const records = await Crypto.find({ coin }).sort({ timestamp: -1 }).limit(100);
    const prices = records.map(record => record.price);

    if (prices.length === 0) {
      return res.status(404).json({ error: 'Not enough data to calculate deviation' });
    }

    const deviation = calculateStandardDeviation(prices);
    res.json({ deviation: deviation.toFixed(2) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  fetchCryptoData,
  getStats,
  getDeviation,
};
