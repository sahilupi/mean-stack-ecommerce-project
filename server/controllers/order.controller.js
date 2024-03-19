const mongoose = require('mongoose');
const Product = mongoose.model('Product');;

const devEnv = require('../dev-env/dev-env');
const stripe = require('stripe')(process.env.STRIPE_SECRET || devEnv.STRIPE_SECRET);
const Order = mongoose.model('Order');
const OrderItem = mongoose.model('OrderItem');
const User = mongoose.model('User');
const { generateOTP } = require('../util/otp.util');
let otp;

module.exports.getOrders = (req, res, next) => {
    try {
        Order.find().populate('user', 'name email').sort({
            'dateOrdered': -1
        }).then(orders => {
            if (!orders || orders.length < 1) {
                return res.status(404).json({
                    success: false,
                    message: 'No orders found.'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    orders: orders
                });
            }
        }).catch(err => {
            console.log(err)
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.getTotalSales = (req, res, next) => {
    try {
        Order.find().select('totalPrice').then(orders => {
            if (!orders || orders.length < 1) {
                return res.status(404).json({
                    success: false,
                    message: 'No orders found.'
                });
            } else {
                let totalSales = 0
                orders.reduce((acc, curr) => {
                    totalSales += curr.totalPrice;
                }, 0);
                return res.status(200).json({
                    success: true,
                    totalSales: totalSales
                });
            }
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.getOrderCount = (req, res, next) => {
    try {
        Order.countDocuments().then(orderCount => {
            if (!orderCount || orderCount.length < 1) {
                return res.status(404).json({
                    success: false,
                    message: 'No Orders found.'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    orderCount: orderCount
                });
            }
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.getUserOrders = (req, res, next) => {
    try {
        Order.find({
            user: req._id
        }).populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category'
            }
        }).sort({
            'dateOrdered': -1
        }).then(userOrders => {
            if (!userOrders || userOrders.length < 1) {
                return res.status(404).json({
                    success: false,
                    message: 'No orders found.'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    orders: userOrders
                });
            }
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.getOrder = (req, res, next) => {
    try {
        Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    populate: 'category'
                }
            })
            .then(order => {
                if (!order || order.length < 1) {
                    return res.status(404).json({
                        success: false,
                        message: 'No order found.'
                    });
                } else {
                    return res.status(200).json({
                        success: true,
                        order: order
                    });
                }
            }).catch(err => {
                return next(err);
            })
    } catch (err) {
        return next(err);
    }
};

module.exports.postOrder = async (req, res, next) => {
    try {
        const user = await User.findById(req._id);
        const orderItemIds = Promise.all(req.body.orderItems.map(orderItem => {
            let newOrderItem = new OrderItem({
                product: orderItem.productId,
                quantity: orderItem.quantity
            });
            // newOrderItem = await newOrderItem.save();
            // return newOrderItem._id
            return newOrderItem.save().then(saveOrderItem => {
                if (!saveOrderItem) {
                    return res.status(503).send({
                        success: false,
                        message: 'Order Items can\'t be saved! Please try again.'
                    });
                }
                return saveOrderItem._id;
            }).catch(err => {
                return next(err);
            });
        }));

        const orderItemIdsResolved = await orderItemIds;

        const totalPrices = await Promise.all(orderItemIdsResolved.map(async orderItemId => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price currency');
            const totalPrice = orderItem.product.price * orderItem.quantity;
            // const currency = orderItem.product.currency
            return totalPrice;
        }));


        // const totalPrice = totalPrices.map(resObj => {
        //     const totalPr =+ resObj.totalPrice
        //     return totalPr;
        // })
        // const finalTotalPrice = totalPrice.reduce((a, b) => a + b, 0);
        // const currency = totalPrices.map(resObj => {
        //     return resObj.currency;
        // });

        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
        otp = generateOTP(8);

        const order = new Order({
            orderItems: orderItemIdsResolved,
            address: {
                shippingAddress1: req.body.address.shippingAddress1,
                shippingAddress2: req.body.address.shippingAddress2,
                city: req.body.address.city,
                zip: req.body.address.zip,
                country: req.body.address.country,
                phone: req.body.address.phone
            },
            totalPrice: totalPrice,
            user: req._id ? req._id : req.body.userId,
            paymentStatus: 'Pending',
            orderSessionId: req.body.sessionId
        });

        order.save().then((savedOrder) => {
            if (!savedOrder) {
                return res.status(503).send({
                    success: false,
                    message: 'Order can not be placed! Please try again.'
                });
            }
            return res.status(201).send({
                success: true,
                message: 'Order placed succussfully!'
            });
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.createOrderSession = async (req, res, next) => {
    const orderItems = req.body.orderBody.orderItems;
    if (!orderItems) {
        return res.status(400).json({
            success: false,
            message: 'Please check your order items'
        })
    }

    const lineItems = await Promise.all(
        orderItems.map(async (orderItem) => {
            const product = await Product.findById(orderItem.productId._id);
            return {
                price_data: {
                    currency: 'INR',
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: +product.price * 100
                },
                quantity: +orderItem.quantity
            }
        })
    );

    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: req.body.domain + '/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: req.body.domain + '/cart',
    });
    return res.status(200).json({
        success: true,
        message: 'Creating order',
        sessionId: session.id
    });
}

module.exports.confirmOrder = async (req, res, next) => {
    try {
        const user = await User.findById(req._id);

        const order = await Order.findOne({
            orderSessionId: req.body.orderSessionId
        });

        if (!order || !user) {
            return res.status(404).json({
                success: false,
                message: 'Order id or User not found'
            })
        }

        order.paymentStatus = "Success";

        order.save().then((savedOrder) => {
            if (!savedOrder) {
                return res.status(503).send({
                    success: false,
                    message: 'Order can not be placed! Please try again.'
                });
            }
            return user.clearCart();
        }).then(() => {
            return res.status(201).send({
                success: true,
                message: 'Order placed succussfully!'
            });
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.updateOrderStatus = (req, res, next) => {
    try {
        Order.findByIdAndUpdate(req.params.id).then((founededOrder) => {
            if (!founededOrder) {
                return res.status(404).send({
                    success: false,
                    message: 'Category not found!'
                });
            } else {
                founededOrder.status = req.body.status;
            };

            founededOrder.save().then((savedOrder) => {
                if (!savedOrder) {
                    return res.status(503).send({
                        success: false,
                        message: 'Order status can not be updated! Please try again.'
                    });
                }
                return res.status(201).send({
                    success: true,
                    message: 'Order status updated!',
                    order: savedOrder
                });
            }).catch(err => {
                return next(err);
            })
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.deleteOrder = (req, res, next) => {
    try {
        Order.findByIdAndRemove(req.params.id).then(async order => {
            if (!order) {
                return res.status(404).send({
                    success: false,
                    message: 'Order not found!'
                });
            };
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem);
            });
            return res.status(201).send({
                success: true,
                message: 'Order deleted succussfully!'
            });
        }).catch(err => {
            return next(err);
        });
    } catch (err) {
        return next(err);
    };
};

// order example 

// {
//     "orderItems": [
//         {
//             "quantity": 3,
//             "productId": "63f21a57de1e5160ff23a9cc"
//         },
//         {
//             "quantity": 2,
//             "product": "63f21ba24bd1593b2ca48add"
//         }
//     ],
//     "shippingAddress1": "Address 1",
//     "shippingAddress2": "Address 2",
//     "city": "Mohali",
//     "zip": "123456",
//     "country": "India",
//     "phone": "9898989898"
//     "user": "63f24bde043f5acaf6b8bb27"
// }