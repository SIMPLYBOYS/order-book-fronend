import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import io from 'socket.io-client';
import { throttle } from 'lodash';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const UPDATE_INTERVAL = 5000; // 5 seconds

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [], bidSum: '0', askSum: '0' });
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const throttledSetOrderBook = useCallback(
    throttle((data) => {
      console.log('Received order book data:', data); // Debug log
      setOrderBook(prevOrderBook => {
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

  const chartData = useMemo(() => {
    console.log('Preparing chart data from:', orderBook); // Debug log

    const processOrders = (orders, type) => {
      if (!Array.isArray(orders)) {
        console.error(`${type} is not an array:`, orders);
        return [];
      }

      let cumulativeSize = 0;
      let cumulativeProduct = 0;
      return orders.reduce((acc, order) => {
        let price, size;
        if (Array.isArray(order)) {
          [price, size] = order;
        } else if (typeof order === 'object' && order !== null) {
          ({ price, size } = order);
        } else {
          console.error(`Invalid ${type} order:`, order);
          return acc;
        }

        const floatPrice = parseFloat(price);
        const floatSize = parseFloat(size);
        
        if (type === 'ask') {
          cumulativeSize += floatSize;
          if (cumulativeSize > 150) return acc; // Stop adding if sum exceeds 150
        } else {
          cumulativeProduct += floatPrice * floatSize;
          if (cumulativeProduct > 5) return acc; // Stop adding if product sum exceeds 5
        }

        acc.push({
          price: floatPrice,
          [type === 'ask' ? 'askVolume' : 'bidVolume']: type === 'ask' ? cumulativeSize : cumulativeProduct,
          [type === 'ask' ? 'bidVolume' : 'askVolume']: 0
        });
        return acc;
      }, []);
    };

    const bidData = processOrders(orderBook.bids, 'bid');
    const askData = processOrders(orderBook.asks, 'ask');

    return [...bidData, ...askData].sort((a, b) => a.price - b.price);
  }, [orderBook]);

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
    if (!Array.isArray(orders)) {
      console.error(`${type} is not an array:`, orders);
      return <p>Error: Invalid data structure for {type}</p>;
    }

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
          {orders.map((order, index) => {
            let price, size;
            if (Array.isArray(order)) {
              [price, size] = order;
            } else if (typeof order === 'object' && order !== null) {
              ({ price, size } = order);
            } else {
              return null; // Skip invalid orders
            }
            return (
              <tr key={`${type}-${index}`}>
                <td style={{ color: type === 'bid' ? 'green' : 'red' }}>{price}</td>
                <td>{size}</td>
                <td>{(parseFloat(price) * parseFloat(size)).toFixed(8)}</td>
              </tr>
            );
          })}
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
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ width: '48%' }}>
          <h2>Bids</h2>
          {renderOrderTable(orderBook.bids, 'bid')}
        </div>
        
        <div style={{ width: '48%' }}>
          <h2>Asks</h2>
          {renderOrderTable(orderBook.asks, 'ask')}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;