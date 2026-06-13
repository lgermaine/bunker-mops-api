import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let mopsToday = 1.42;
    let brentToday = 89.50;
    let mopsYesterday = 1.40;
    let brentYesterday = 89.30;

    try {
      const response = await fetch('https://shipandbunker.com/api/prices/port/682/product/fuel-oil-380', {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        mopsToday = data.price || 1.42;
      }
    } catch (e) {
      console.log('Ship and Bunker fetch failed, using defaults');
    }

    const mopsTrend = mopsToday > mopsYesterday ? 'up' : mopsToday < mopsYesterday ? 'down' : 'flat';
    const brentTrend = brentToday > brentYesterday ? 'up' : brentToday < brentYesterday ? 'down' : 'flat';
    const mopsMovement = parseFloat((mopsToday - mopsYesterday).toFixed(3));
    const brentMovement = parseFloat((brentToday - brentYesterday).toFixed(2));

    return res.status(200).json({
      success: true,
      today: {
        mops: mopsToday,
        brent: brentToday,
        date: todayStr
      },
      yesterday: {
        mops: mopsYesterday,
        brent: brentYesterday
      },
      trend: {
        mops: mopsTrend,
        brent: brentTrend,
        mopsMovement: mopsMovement,
        brentMovement: brentMovement
      },
      scenario: `MOPS ${mopsTrend.toUpperCase()} + Brent ${brentTrend.toUpperCase()}`
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      today: { mops: 1.42, brent: 89.50 },
      yesterday: { mops: 1.40, brent: 89.30 },
      trend: { mops: 'flat', brent: 'flat' }
    });
  }
}
