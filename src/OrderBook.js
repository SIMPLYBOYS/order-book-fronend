import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [], bidSum: '0', askSum: '0' });
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

  const chartData = [
    ...orderBook.bids.map(order => ({ price: parseFloat(order.price), bidSize: parseFloat(order.size), askSize: 0 })),
    ...orderBook.asks.map(order => ({ price: parseFloat(order.price), bidSize: 0, askSize: parseFloat(order.size) }))
  ].sort((a, b) => a.price - b.price);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Order Book</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ width: '48%' }}>
          <h2>Bids</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Price</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Size</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderBook.bids.map((order, index) => (
                <tr key={`bid-${index}`}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', color: 'green' }}>{order.price}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.size}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(parseFloat(order.price) * parseFloat(order.size)).toFixed(8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>Bid Sum (size * price): {orderBook.bidSum}</p>
        </div>
        
        <div style={{ width: '48%' }}>
          <h2>Asks</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Price</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Size</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderBook.asks.map((order, index) => (
                <tr key={`ask-${index}`}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', color: 'red' }}>{order.price}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.size}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(parseFloat(order.price) * parseFloat(order.size)).toFixed(8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>Ask Sum (size): {orderBook.askSum}</p>
        </div>
      </div>

      <h2>Order Book Visualization</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="price" type="number" domain={['dataMin', 'dataMax']} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="stepAfter" dataKey="bidSize" stroke="#8884d8" name="Bids" />
          <Line type="stepAfter" dataKey="askSize" stroke="#82ca9d" name="Asks" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderBook;