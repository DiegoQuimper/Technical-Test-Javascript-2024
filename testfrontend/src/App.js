import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button } from '@mui/material';
import MyOrders from './components/MyOrders.js';
import AddEditOrder from './components/AddEditOrder.js';
import EditOrder from './components/EditOrder.js';
import { useState } from 'react';

function App() {
  const [orderId, setOrderId] = useState(null); // Estado para almacenar el ID dinámico

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/my-orders">My Orders</Button>
          <Button color="inherit" component={Link} to={`/add-order/${orderId}`}>Add Order</Button>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/add-order/:id" element={<AddEditOrder />} />
        <Route path="/edit-order/:id" element={<EditOrder />} />
      </Routes>
    </Router>
  );
}

export default App;
