const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: [true, 'Order Items are required']
    }],
    address: {
        type: Object,
        shippingAddress1: {
            type: String,
            required: [true, 'Shipping address is required']
        },
        shippingAddress2: {
            type: String
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        zip: {
            type: String,
            required: [true, 'Zip code is required']
        },
        country: {
            type: String,
            required: [true, 'Shipping country is required']
        },
        phone: {
            type: String,
            required: [true, 'Contact number is required']
        }
    },
    status: {
        type: String,
        default: 'Pending'
    },
    totalPrice: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order owner is required']
    },
    currency: {
        type: String,
        default: 'INR'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        required: true,
        default: 'Pending'
    },
    orderSessionId: {
        type: String || null,
        trim: true
    }
}, {
    timestamps: true
});

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true
});

mongoose.model('Order', orderSchema);