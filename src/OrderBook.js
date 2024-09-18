import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import io from 'socket.io-client';
import { throttle, isEqual } from 'lodash';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const UPDATE_INTERVAL = 1000; // 1 seconds

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState({
    bids: [],
    asks: [],
    bidSum: '0',
    askSum: '0'
  });
  const [chartData, setChartData] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const calculateChartData = useCallback((bids, asks) => {
    const bidData = bids.reduce((acc, order, index) => {
      const price = parseFloat(order.price);
      const size = parseFloat(order.size);
      const prevVolume = index > 0 ? acc[index - 1].bidVolume : 0;
      acc.push({
        price,
        bidVolume: prevVolume + size,
        askVolume: 0
      });
      return acc;
    }, []);

    const askData = asks.reduce((acc, order, index) => {
      const price = parseFloat(order.price);
      const size = parseFloat(order.size);
      const prevVolume = index > 0 ? acc[index - 1].askVolume : 0;
      acc.push({
        price,
        askVolume: prevVolume + size,
        bidVolume: 0
      });
      return acc;
    }, []);

    return [...bidData, ...askData].sort((a, b) => a.price - b.price);
  }, []);

  const throttledSetOrderBook = useCallback(
    throttle((data) => {
      setOrderBook(prevOrderBook => {
        if (!isEqual(prevOrderBook, data)) {
          setChartData(calculateChartData(data.bids, data.asks));
          return data;
        }
        return prevOrderBook;
      });
    }, UPDATE_INTERVAL, { leading: false, trailing: true }),
    [calculateChartData]
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '5px', border: '1px solid #ccc' }}>
          <p>{`Price: ${label}`}</p>
          <p>{`Bid Volume: ${payload[0]?.value?.toFixed(4) || 'N/A'}`}</p>
          <p>{`Ask Volume: ${payload[1]?.value?.toFixed(4) || 'N/A'}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderOrderTable = (orders, type) => {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Price</th>
            <th>Size</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={`${type}-${index}`}>
              <td style={{ color: type === 'bid' ? 'green' : 'red' }}>{order.price}</td>
              <td>{order.size}</td>
              <td>{(parseFloat(order.price) * parseFloat(order.size)).toFixed(8)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Order Book (Real-time)</h1>
      <div style={{ textAlign: 'center', marginBottom: '20px', color: connectionStatus === 'connected' ? 'green' : 'red' }}>
        Status: {connectionStatus}
      </div>
      
      <div style={{ height: '400px', marginBottom: '20px' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="price" type="number" domain={['dataMin', 'dataMax']} />
              <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
              <YAxis yAxisId="right" orientation="right" stroke="#ff7b7b" />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="left" type="stepAfter" dataKey="bidVolume" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
              <Area yAxisId="right" type="stepAfter" dataKey="askVolume" stroke="#ff7b7b" fill="#ff7b7b" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div>No chart data available</div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ width: '48%' }}>
          <h2>Bids</h2>
          {renderOrderTable(orderBook.bids, 'bid')}
          <p>Bid Sum (size * price): {orderBook.bidSum}</p>
        </div>
        
        <div style={{ width: '48%' }}>
          <h2>Asks</h2>
          {renderOrderTable(orderBook.asks, 'ask')}
          <p>Ask Sum (size): {orderBook.askSum}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;