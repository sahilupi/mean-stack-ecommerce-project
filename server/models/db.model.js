const mongoose = require('mongoose');

const devEnv = require('../dev-env/dev-env');
require('./product.model');
require('./category.model');
require('./user.model');
require('./order.model');
require('./order-item.model');

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI || devEnv.MONGO_URI, {
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connection succeeded.');
}).catch((err) => {
    console.log('Error in MongoDB connection : ' + JSON.stringify(err, undefined, 2));
});

