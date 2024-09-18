import React from 'react';

const OrderTable = React.memo(({ orders, type }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Price</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Size</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order, index) => (
          <tr key={`${type}-${index}`}>
            <td style={{ border: '1px solid #ddd', padding: '8px', color: type === 'bid' ? 'green' : 'red' }}>{order.price}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.size}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(parseFloat(order.price) * parseFloat(order.size)).toFixed(8)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

export default OrderTable;