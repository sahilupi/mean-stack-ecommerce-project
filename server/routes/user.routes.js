const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');
const jwtHelper = require('../middlewares/jwtHelper');

router.get('/get-users', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlUser.getUsers);
router.get('/get-users-count', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlUser.getUserCount);
router.get('/get-user/:id',jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlUser.getUser);
router.get('/get-user-profile', jwtHelper.verifyJwtToken, ctrlUser.getUser);
router.post('/post-user', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlUser.postUser);
router.post('/user-login', ctrlUser.authenticateUser);
router.post('/admin-login', ctrlUser.authenticateUserAsAdmin);
router.put('/update-user/:id', ctrlUser.updateUser);
router.delete('/delete-user/:id', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlUser.deleteUser);

// cart methods
router.post('/post-user-cart', jwtHelper.verifyJwtToken, ctrlUser.postCart);
router.get('/get-user-cart', jwtHelper.verifyJwtToken, ctrlUser.getCart);
router.post('/post-many-to-cart', jwtHelper.verifyJwtToken, ctrlUser.postMultipleToCart);
router.post('/delete-cart-product', jwtHelper.verifyJwtToken, ctrlUser.postCartDeleteProduct);

module.exports = router;