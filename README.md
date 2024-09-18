# Order Book Frontend

This project is a real-time order book visualization for cryptocurrency trading pairs. It displays bids and asks in a tabular format and provides a graphical representation of the order book depth.

## Features

- Real-time updates of order book data
- Tabular display of bids and asks
- Graphical representation of order book depth
- Connection status indicator
- Responsive design

## Technologies Used

- React
- Socket.IO for real-time communication
- Recharts for data visualization
- Lodash for utility functions

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/order-book-frontend.git
   cd order-book-frontend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```
   REACT_APP_BACKEND_URL=http://localhost:3000
   ```
   Replace `http://localhost:3000` with your backend URL if different.

## Running the Application

To run the application in development mode:

```
npm start
```

The application will be available at `http://localhost:3000` (or the next available port).

## Building for Production

To create a production build:

```
npm run build
```

This will create a `build` directory with production-ready files.

## Deployment

1. Create a `.env.production` file in the root directory with your production backend URL:
   ```
   REACT_APP_BACKEND_URL=https://your-production-backend-url.com
   ```

2. Build the project:
   ```
   npm run build
   ```

3. Deploy the contents of the `build` directory to your web server.

## Configuration

You can adjust the update frequency of the order book by modifying the `UPDATE_INTERVAL` constant in `src/components/OrderBook.js`.