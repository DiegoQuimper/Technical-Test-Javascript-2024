import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Select, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/orders')
            .then(response => setOrders(response.data))
            .catch(error => console.error('Error fetching orders:', error));
    }, []);

    const handleDelete = (order) => {
        setSelectedOrder(order);
        setOpen(true);
    };

    const confirmDelete = () => {
        axios.delete(`http://localhost:5000/orders/${selectedOrder.id}`)
            .then(() => {
                setOrders(orders.filter(order => order.id !== selectedOrder.id));
                setOpen(false);
            })
            .catch(error => console.error('Error deleting order:', error));
    };

    const handleChangeStatus = (id, status) => {
        axios.put(`http://localhost:5000/orders/${id}`, { status })
            .then(() => {
                setOrders(orders.map(order => order.id === id ? { ...order, status } : order));
            })
            .catch(error => console.error('Error updating order status:', error));
    };

    const handleEditOrder = (orderId) => {
        navigate(`/edit-order/${orderId}`);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'orderNumber', headerName: 'Order #', width: 130 },
        { field: 'date', headerName: 'Date', width: 130 },
        { field: 'products', headerName: 'Products', width: 130 },
        { field: 'finalPrice', headerName: 'Final Price', width: 130, type: 'number' },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => (
                <Select
                    value={params.row.status}
                    onChange={(e) => handleChangeStatus(params.row.id, e.target.value)}
                    fullWidth
                >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="InProgress">InProgress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                </Select>
            ),
        },
        {
            field: 'options',
            headerName: 'Options',
            width: 200,
            renderCell: (params) => (
                <div>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleEditOrder(params.row.id)}
                        disabled={params.row.status === 'Completed'}
                        style={{ marginRight: '10px' }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(params.row)}
                        disabled={params.row.status === 'Completed'}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <Container>
            <Typography variant="h2" gutterBottom>My Orders</Typography>
            <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/add-order/:id"
                style={{ marginBottom: '20px' }}
            >
                Add New Order
            </Button>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={orders}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                    disableSelectionOnClick
                />
            </div>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>Delete Order</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the order {selectedOrder?.orderNumber}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyOrders;
