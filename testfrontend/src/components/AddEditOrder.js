import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddOrder = () => {
    const navigate = useNavigate();
    const [orderNumber, setOrderNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [products, setProducts] = useState([]);
    const [finalPrice, setFinalPrice] = useState(0);
    const [status, setStatus] = useState('Pending');
    const [open, setOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', qty: 1, unitPrice: 0 });
    const [availableProducts, setAvailableProducts] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        axios.get('http://localhost:5000/products')
            .then(response => setAvailableProducts(response.data))
            .catch(error => console.error('Error fetching products:', error));
    }, []);

    const handleAddProduct = () => {
        const updatedProducts = [
            ...products,
            {
                id: products.length + 1,
                name: newProduct.name,
                qty: newProduct.qty,
                unitPrice: newProduct.unitPrice,
                totalPrice: newProduct.qty * newProduct.unitPrice,
            },
        ];
        setProducts(updatedProducts);
        setFinalPrice(updatedProducts.reduce((total, product) => total + product.totalPrice, 0));
        setOpen(false);
        setNewProduct({ name: '', qty: 1, unitPrice: 0 });
    };

    const handleSave = () => {
        const orderData = {
            orderNumber,
            date,
            products,
            finalPrice,
            status,
        };
        axios.post('http://localhost:5000/orders', orderData)
            .then(response => {
                console.log('Response Status:', response.status);
                console.log('Response Data:', response.data);

                if (response.status === 200) {
                    setSnackbarMessage('Order saved successfully');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                    setTimeout(() => navigate('/my-orders'), 3000); // Wait for 3 seconds before navigating
                } else {
                    throw new Error('Unexpected response status: ' + response.status);
                }
            })
            .catch(error => {
                console.error('Error creating order:', error);
                setSnackbarMessage(`Error saving order: ${error.message}`);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            });
    };

    const handleDeleteProduct = (id) => {
        const updatedProducts = products.filter(product => product.id !== id);
        setProducts(updatedProducts);
        setFinalPrice(updatedProducts.reduce((total, product) => total + product.totalPrice, 0));
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', width: 130 },
        { field: 'unitPrice', headerName: 'Unit Price', width: 130 },
        { field: 'qty', headerName: 'Qty', width: 130 },
        { field: 'totalPrice', headerName: 'Total Price', width: 130 },
        {
            field: 'options',
            headerName: 'Options',
            width: 200,
            renderCell: (params) => (
                <div>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDeleteProduct(params.row.id)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <Container>
            <Typography variant="h4">Add Order</Typography>
            <form noValidate autoComplete="off">
                <TextField
                    label="Order #"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                />
                <TextField
                    label="Date"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={date}
                    disabled
                />
                <TextField
                    label="# Products"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={products.length}
                    disabled
                />
                <TextField
                    label="Final Price"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={finalPrice}
                    disabled
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpen(true)}
                    style={{ marginTop: '20px' }}
                >
                    Add Product
                </Button>
                <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
                    <DataGrid
                        rows={products}
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
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    style={{ marginTop: '20px' }}
                >
                    Save Order
                </Button>
            </form>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add/Edit Product</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the product details.
                    </DialogContentText>
                    <Select
                        value={newProduct.name}
                        onChange={(e) => {
                            const selectedProduct = availableProducts.find(product => product.name === e.target.value);
                            setNewProduct({ ...newProduct, name: selectedProduct.name, unitPrice: selectedProduct.unitPrice });
                        }}
                        fullWidth
                    >
                        {availableProducts.map(product => (
                            <MenuItem key={product.id} value={product.name}>
                                {product.name}
                            </MenuItem>
                        ))}
                    </Select>
                    <TextField
                        margin="dense"
                        label="Quantity"
                        type="number"
                        fullWidth
                        value={newProduct.qty}
                        onChange={(e) => setNewProduct({ ...newProduct, qty: parseInt(e.target.value) })}
                    />
                    <TextField
                        margin="dense"
                        label="Unit Price"
                        type="number"
                        fullWidth
                        value={newProduct.unitPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) })}
                        disabled
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddProduct} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AddOrder;
