import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import io from 'socket.io-client';

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [], bidSum: '0', askSum: '0' });
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
      upgrade: false,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('connected');
    });

    socket.on('orderBookUpdate', (data) => {
      setOrderBook(data);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setConnectionStatus('error');
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const chartData = [
    ...orderBook.bids.map(order => ({ price: parseFloat(order.price), bidSize: parseFloat(order.size), askSize: 0 })),
    ...orderBook.asks.map(order => ({ price: parseFloat(order.price), bidSize: 0, askSize: parseFloat(order.size) }))
  ].sort((a, b) => a.price - b.price);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Order Book (Real-time)</h1>
      <div style={{ textAlign: 'center', marginBottom: '20px', color: connectionStatus === 'connected' ? 'green' : 'red' }}>
        Status: {connectionStatus}
      </div>
      
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