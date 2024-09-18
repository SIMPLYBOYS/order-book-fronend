import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import io from 'socket.io-client';
import { throttle } from 'lodash';
import OrderTable from './OrderTable';  // Assuming you've created this optimized component

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const UPDATE_INTERVAL = 1000; // 1 seconds

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [], bidSum: '0', askSum: '0' });
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const throttledSetOrderBook = useCallback(
    throttle((data) => {
      setOrderBook(prevOrderBook => {
        // Only update if data has changed
        if (JSON.stringify(prevOrderBook) !== JSON.stringify(data)) {
          return data;
        }
        return prevOrderBook;
      });
    }, UPDATE_INTERVAL, { leading: false, trailing: true }),
    []
  );

  useEffect(() => {
    const socket = io(BACKEND_URL, {
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
      throttledSetOrderBook(data);
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
  }, [throttledSetOrderBook]);

  const chartData = useMemo(() => [
    ...orderBook.bids.map(order => ({ price: parseFloat(order.price), bidSize: parseFloat(order.size), askSize: 0 })),
    ...orderBook.asks.map(order => ({ price: parseFloat(order.price), bidSize: 0, askSize: parseFloat(order.size) }))
  ].sort((a, b) => a.price - b.price), [orderBook]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Order Book (Real-time)</h1>
      <div style={{ textAlign: 'center', marginBottom: '20px', color: connectionStatus === 'connected' ? 'green' : 'red' }}>
        Status: {connectionStatus}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ width: '48%' }}>
          <h2>Bids</h2>
          <OrderTable orders={orderBook.bids} type="bid" />
          <p>Bid Sum (size * price): {orderBook.bidSum}</p>
        </div>
        
        <div style={{ width: '48%' }}>
          <h2>Asks</h2>
          <OrderTable orders={orderBook.asks} type="ask" />
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