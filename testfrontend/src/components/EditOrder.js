import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [orderNumber, setOrderNumber] = useState('');
    const [date, setDate] = useState('');
    const [products, setProducts] = useState([]);
    const [finalPrice, setFinalPrice] = useState(0);
    const [status, setStatus] = useState('Pending');
    const [open, setOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', qty: 1, unitPrice: 0 });
    const [availableProducts, setAvailableProducts] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    console.log('El componente EditOrder se está montando');

    useEffect(() => {
        axios.get(`http://localhost:5000/orders/${id}`)
            .then(response => {
                const existingOrder = response.data;
                setOrderNumber(existingOrder.orderNumber);
                setDate(existingOrder.date);
                setStatus(existingOrder.status);
                setFinalPrice(existingOrder.finalPrice);

                // Ensure products are set even if the response doesn't contain them directly
                const fetchedProducts = existingOrder.products || [];
                setProducts(fetchedProducts);

                // Log fetched products to debug
                console.log('Productos de la orden:', fetchedProducts);
            })
            .catch(error => {
                console.error('Error fetching order:', error);
            });

        axios.get('http://localhost:5000/products')
            .then(response => {
                setAvailableProducts(response.data);
                console.log('Productos disponibles:', response.data);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }, [id]);

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
        axios.put(`http://localhost:5000/orders/${id}`, orderData)
            .then(() => {
                setSnackbarMessage('Orden actualizada exitosamente');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                navigate('/my-orders');
            })
            .catch(error => {
                console.error('Error updating order:', error);
                setSnackbarMessage(`Error al actualizar la orden: ${error.message}`);
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
            <Typography variant="h4">Editar Orden</Typography>
            <form noValidate autoComplete="off">
                <TextField
                    label="Orden #"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={orderNumber}
                    InputProps={{
                        readOnly: true,
                    }}
                />
                <TextField
                    label="Fecha"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={date}
                    InputProps={{
                        readOnly: true,
                    }}
                />
                <TextField
                    label="# Productos"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={products.length}
                    InputProps={{
                        readOnly: true,
                    }}
                />
                <TextField
                    label="Precio Final"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={finalPrice}
                    InputProps={{
                        readOnly: true,
                    }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpen(true)}
                    style={{ marginTop: '20px' }}
                >
                    Agregar Producto
                </Button>
                <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
                    <DataGrid
                        rows={products}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10]}
                        disableSelectionOnClick
                    />
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    style={{ marginTop: '20px' }}
                >
                    Actualizar Orden
                </Button>
            </form>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Agregar/Editar Producto</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Por favor ingrese los detalles del producto.
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
                        label="Cantidad"
                        type="number"
                        fullWidth
                        value={newProduct.qty}
                        onChange={(e) => setNewProduct({ ...newProduct, qty: parseInt(e.target.value) })}
                    />
                    <TextField
                        margin="dense"
                        label="Precio Unitario"
                        type="number"
                        fullWidth
                        value={newProduct.unitPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) })}
                        disabled
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleAddProduct} color="primary">
                        Guardar
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

export default EditOrder;
