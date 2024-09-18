import React, { useState, useEffect } from 'react';

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await fetch('http://localhost:3000/orderbook');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setOrderBook(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch order book data');
        setLoading(false);
      }
    };

    fetchOrderBook();
    // Fetch data every 30 seconds
    const interval = setInterval(fetchOrderBook, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Order Book</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '48%' }}>
          <h2>Bids</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Price</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Size</th>
              </tr>
            </thead>
            <tbody>
              {orderBook.bids.map((order, index) => (
                <tr key={`bid-${index}`}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', color: 'green' }}>{order.price}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ width: '48%' }}>
          <h2>Asks</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Price</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Size</th>
              </tr>
            </thead>
            <tbody>
              {orderBook.asks.map((order, index) => (
                <tr key={`ask-${index}`}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', color: 'red' }}>{order.price}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;