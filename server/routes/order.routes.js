const express = require('express');
const router = express.Router();

const ctrlOrder = require('../controllers/order.controller');
const jwtHelper = require('../middlewares/jwtHelper');
// for admin
router.get('/get-orders', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlOrder.getOrders);
router.get('/get-orders-count', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlOrder.getOrderCount);
router.get('/get-totalsales', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlOrder.getTotalSales);
// for specific user
router.get('/get-user-orders', ctrlOrder.getUserOrders);
router.get('/get-order/:id', ctrlOrder.getOrder);
router.post('/post-order', jwtHelper.verifyJwtToken, ctrlOrder.postOrder);
router.post('/confirm-order', jwtHelper.verifyJwtToken, ctrlOrder.confirmOrder);
router.post('/create-order-session', jwtHelper.verifyJwtToken, ctrlOrder.createOrderSession);
router.put('/update-order-status/:id', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlOrder.updateOrderStatus);
router.delete('/delete-order/:id', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlOrder.deleteOrder);

module.exports = router;