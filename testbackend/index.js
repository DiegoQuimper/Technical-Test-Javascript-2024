const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 5000; // Puedes ajustar el puerto según tu preferencia

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'my_orders_db'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database: ', err);
        return;
    }
    console.log('Connected to MySQL database!');
});



// Routes

// Get all orders
app.get('/orders', (req, res) => {
    const query = `
        SELECT o.id, o.orderNumber, o.date, o.status, o.finalPrice, COUNT(op.productId) AS numProducts
        FROM orders o
        LEFT JOIN order_products op ON o.id = op.orderId
        GROUP BY o.id
    `;
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});

// Get all products
app.get('/products', (req, res) => {
    const query = 'SELECT * FROM products';
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});

// Get order by ID
app.get('/orders/:id', (req, res) => {
    const orderId = req.params.id;
    const orderQuery = `
        SELECT o.id, o.orderNumber, o.date, o.status, o.finalPrice, 
               p.id AS productId, p.name, p.unitPrice, op.quantity
        FROM orders o
        LEFT JOIN order_products op ON o.id = op.orderId
        LEFT JOIN products p ON op.productId = p.id
        WHERE o.id = ?
    `;

    connection.query(orderQuery, [orderId], (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Order not found');
            return;
        }

        const order = {
            id: results[0].id,
            orderNumber: results[0].orderNumber,
            date: results[0].date,
            status: results[0].status,
            finalPrice: results[0].finalPrice,
            products: []
        };

        results.forEach(row => {
            if (row.productId) {
                order.products.push({
                    id: row.productId,
                    name: row.name,
                    unitPrice: row.unitPrice,
                    quantity: row.quantity
                });
            }
        });

        res.json(order);
    });
});
// Create a new order
app.post('/orders', (req, res) => {
    const { orderNumber, date, status, finalPrice, products } = req.body;

    const orderQuery = 'INSERT INTO orders (orderNumber, date, status, finalPrice) VALUES (?, ?, ?, ?)';
    connection.query(orderQuery, [orderNumber, date, status, finalPrice], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        const orderId = result.insertId;
        const orderProducts = products.map(p => [orderId, p.productId, p.quantity]);
        const orderProductsQuery = 'INSERT INTO order_products (orderId, productId, quantity) VALUES ?';
        connection.query(orderProductsQuery, [orderProducts], (err) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(201).send('Order created successfully');
        });
    });
});

// Update an order
app.put('/orders/:id', (req, res) => {
    const orderId = req.params.id;
    const { orderNumber, date, status, finalPrice, products } = req.body;

    const orderQuery = 'UPDATE orders SET orderNumber = ?, date = ?, status = ?, finalPrice = ? WHERE id = ?';
    connection.query(orderQuery, [orderNumber, date, status, finalPrice, orderId], (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        const deleteOrderProductsQuery = 'DELETE FROM order_products WHERE orderId = ?';
        connection.query(deleteOrderProductsQuery, [orderId], (err) => {
            if (err) {
                res.status(500).send(err);
                return;
            }

            const orderProducts = products.map(p => [orderId, p.productId, p.quantity]);
            const orderProductsQuery = 'INSERT INTO order_products (orderId, productId, quantity) VALUES ?';
            connection.query(orderProductsQuery, [orderProducts], (err) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.status(200).send('Order updated successfully');
            });
        });
    });
});

// Delete an order
app.delete('/orders/:id', (req, res) => {
    const orderId = req.params.id;

    const deleteOrderProductsQuery = 'DELETE FROM order_products WHERE orderId = ?';
    connection.query(deleteOrderProductsQuery, [orderId], (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        const deleteOrderQuery = 'DELETE FROM orders WHERE id = ?';
        connection.query(deleteOrderQuery, [orderId], (err) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(200).send('Order deleted successfully');
        });
    });
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
