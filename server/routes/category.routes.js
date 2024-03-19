const express = require('express');
const router = express.Router();

const ctrlCategory = require('../controllers/category.controller');
const jwtHelper = require('../middlewares/jwtHelper');

router.get('/get-categories', ctrlCategory.getCategories);
router.get('/get-category/:id', ctrlCategory.getCategory);
router.post('/post-category', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlCategory.postCategory);
router.delete('/delete-category/:id', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlCategory.deleteCategory);
router.put('/update-category/:id', jwtHelper.verifyJwtToken, jwtHelper.isAdmin, ctrlCategory.updateCategory);

module.exports = router;