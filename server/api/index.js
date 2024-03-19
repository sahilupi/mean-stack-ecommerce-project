const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');


require('dotenv').config();
require('../models/db.model');
const devEnv = require('../dev-env/dev-env');
const productRoutes = require('../routes/product.routes');
const categoryRoutes = require('../routes/category.routes');
const orderRoutes = require('../routes/order.routes');
const userRoutes = require('../routes/user.routes');

const port = process.env.PORT || devEnv.PORT;
const api = process.env.API_URL || devEnv.API_URL;
// const authJwt = require('../middlewares/jwt-auth');
const app = express();
app.use(cors());

// Middelwares
app.use(bodyParser.json());
app.use("public/uploads", express.static(path.join(__dirname, "public/uploads")));
// app.use(authJwt());

// Routes
app.use(`${api}/products`, productRoutes);
app.use(`${api}/categories`, categoryRoutes);
app.use(`${api}/orders`, orderRoutes);
app.use(`${api}/users`, userRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.log(err);
    if (err.name === 'ValidationError') {
        const valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        return res.status(422).send(valErrors);
    }
    if (err.statusCode === 401 && err.error.code === 'BAD_REQUEST_ERROR') {
        return res.status(401).send({
            success: false,
            message: err.error.description,
        });
    }
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(500).json({
            success: false,
            message: 'Invalid Id'
        })
    }
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid Token'
        })
    }
    return res.status(503).send(err);
});

// app.use(express.static(path.join(__dirname, 'www')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'www/index.html'));
// });

app.listen(port, () => {
    console.log('Server is listening on port ' + port)
})