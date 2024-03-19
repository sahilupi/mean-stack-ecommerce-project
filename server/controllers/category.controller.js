const mongoose = require('mongoose');

const Category = mongoose.model('Category');

module.exports.getCategories = (req, res, next) => {
    try {
        Category.find().then(categories => {
            if (!categories || categories.length < 1) {
                return res.status(404).json({
                    success: false,
                    message: 'No categories found.'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    categories: categories
                });
            }
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.postCategory = (req, res, next) => {
    try {
        const category = new Category({
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        });

        category.save().then((savedCategory) => {
            if (!savedCategory) {
                return res.status(503).send({
                    success: false,
                    message: 'Category can not be created! Please try again.'
                });
            }
            return res.status(201).send({
                success: true,
                message: 'Category ' + savedCategory.name + ' added succussfully!'
            });
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.deleteCategory = (req, res, next) => {
    try {
        Category.findByIdAndRemove(req.params.id).then((category) => {
            if (!category) {
                return res.status(404).send({
                    success: false,
                    message: 'Category not found!'
                });
            }
            return res.status(201).send({
                success: true,
                message: 'Category deleted succussfully!'
            });
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.getCategory = (req, res, next) => {
    try {
        Category.findById(req.params.id).then((category) => {
            if (!category) {
                return res.status(404).send({
                    success: false,
                    message: 'Category not found!'
                });
            }
            return res.status(201).send({
                success: true,
                message: 'Category fetched succussfully!',
                category: category
            });
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.updateCategory = (req, res, next) => {
    try {
        Category.findByIdAndUpdate(req.params.id).then((founededCategory) => {
            if (!founededCategory) {
                return res.status(404).send({
                    success: false,
                    message: 'Category not found!'
                });
            } else {
                if (req.body.name) {
                    founededCategory.name = req.body.name;
                }
                if (req.body.icon) {
                    founededCategory.icon = req.body.icon;
                }
                if (req.body.color) {
                    founededCategory.color = req.body.color;
                }
            };

            founededCategory.save().then((savedCategory) => {
                if (!savedCategory) {
                    return res.status(503).send({
                        success: false,
                        message: 'Category can not be updated! Please try again.'
                    });
                }
                return res.status(201).send({
                    success: true,
                    message: 'Category updated succussfully!',
                    category: savedCategory
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