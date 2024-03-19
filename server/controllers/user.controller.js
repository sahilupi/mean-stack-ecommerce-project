const mongoose = require('mongoose');

const User = mongoose.model('User');
const Product = mongoose.model('Product');

const userExists = async (email) => {
    const user = await User.findOne({
        email: email.toLowerCase().trim()
    })
    if (user) {
        return true;
    } else {
        return false;
    }
}

module.exports.getUsers = (req, res, next) => {
    try {
        User.find().select('-passwordHash').then(users => {
            if (!users || users.length < 1) {
                return res.status(404).json({
                    success: false,
                    message: 'No users found.'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    users: users
                });
            }
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
}

module.exports.getUser = (req, res, next) => {
    try {
        const id = req.params.id ? req.params.id : req._id;
        User.findById(id).select('-passwordHash').then((user) => {
            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: 'No account found with this email address!'
                });
            }
            return res.status(201).send({
                success: true,
                message: 'User fetched succussfully!',
                user: user
            });
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.postUser = async (req, res, next) => {
    try {
        let user = new User({
            name: req.body.name,
            passwordHash: User.hashPassword(req.body.password),
            email: req.body.email,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            address: {
                street: req.body.street,
                apartment: req.body.apartment,
                city: req.body.city,
                zip: req.body.zip,
                country: req.body.country,
            }
        });

        // if (req.body.password !== req.body.confirmPassword) {
        //     return res.status(422).send({
        //         success: false,
        //         message: 'Passwords do not match'
        //     });
        // }

        if (await userExists(req.body.email)) {
            return res.status(409).json({
                success: false,
                message: 'Account with this email address exists already! Please try with different one'
            })
        }
        user.save().then((saveUser) => {
            if (!saveUser) {
                return res.status(500).send({
                    success: false,
                    message: 'An error occured! Please try again.'
                })
            }
            return res.status(200).send({
                success: true,
                message: 'Account created succussfully!'
            });
        }).catch(err => {
            if (err.code == 11000)
                return res.status(409).send({
                    success: false,
                    message: 'Account with this email address exists already!'
                });
            else
                return next(err);
        })

    } catch (err) {
        return next(err);
    }
}

module.exports.updateUser = async (req, res, next) => {
    try {
        User.findByIdAndUpdate(req.params.id).then((founededUser) => {
            if (!founededUser) {
                return res.status(404).send({
                    success: false,
                    message: 'No account found with this email address!'
                });
            } else {
                founededUser.isAdmin = req.body.isAdmin;
                if (req.body.name) {
                    founededUser.name = req.body.name;
                }
                if (req.body.email) {
                    founededUser.email = req.body.email;
                }
                if (req.body.password) {
                    founededUser.passwordHash = User.hashPassword(req.body.password);
                }
                if (req.body.phone) {
                    founededUser.phone = req.body.phone;
                }
                if (req.body.street || req.body.apartment || req.body.city || req.body.zip || req.body.country) {
                    founededUser.address = {
                        street: req.body.street,
                        city: req.body.city,
                        apartment: req.body.apartment,
                        zip: req.body.zip,
                        country: req.body.country,
                    };
                }
            };

            founededUser.save().then((savedUser) => {
                if (!savedUser) {
                    return res.status(503).send({
                        success: false,
                        message: 'Details can not be updated! Please try again.'
                    });
                }
                return res.status(201).send({
                    success: true,
                    message: 'Profile updated succussfully!',
                    user: savedUser
                });
            }).catch(err => {
                return next(err);
            });
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.authenticateUser = (req, res, next) => {
    try {
        User.findOne({
            email: req.body.email
        }).then((user) => {
            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: 'No account found with this email address!'
                });
            } else if (!user.verifyPassword(req.body.password)) {
                return res.status(401).send({
                    success: false,
                    message: 'Incorrect password'
                });
            }
            return res.status(200).send({
                success: true,
                message: 'User fetched succussfully!',
                _id: user['_id'],
                name: user['name'],
                token: user.generateJwt(req.body.remeberMe)
            });
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.authenticateUserAsAdmin = (req, res, next) => {
    try {
        User.findOne({
            email: req.body.email
        }).then((user) => {
            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: 'No account found with this email address!'
                });
            } else if (!user.verifyPassword(req.body.password)) {
                return res.status(401).send({
                    success: false,
                    message: 'Incorrect password'
                });
            } else if (!user.isAdmin) {
                return res.status(401).send({
                    message: 'Not Authorized.'
                });
            }
            return res.status(200).send({
                success: true,
                message: 'User fetched succussfully!',
                _id: user['_id'],
                name: user['name'],
                token: user.generateJwt(req.body.remeberMe)
            });
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.getUserCount = (req, res, next) => {
    try {
        User.countDocuments().then(userCount => {
            if (!userCount || userCount.length < 1) {
                return res.status(404).json({
                    success: false,
                    message: 'No Users found.'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    userCount: userCount
                });
            }
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

module.exports.deleteUser = (req, res, next) => {
    try {
        User.findByIdAndRemove(req.params.id).then((user) => {
            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: 'User not found!'
                });
            }
            return res.status(201).send({
                success: true,
                message: 'User account deleted succussfully!'
            });
        }).catch(err => {
            return next(err);
        })
    } catch (err) {
        return next(err);
    }
};

// User Cart methods
module.exports.postCart = async (req, res, next) => {
    const user = await User.findById(req._id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'No account found with this id'
        })
    }
    const prodId = req.body.productId;
    const quantity = req.body.quantity;
    Product.findById(prodId)
        .then(product => {
            return user.addToCart(product, quantity, req.body.increaseQuantity);
        })
        .then(result => {
            let totalPrice = 0;
            let quantity = 0;
            const options = {
                path: 'cart.items.productId'
            };
            user.populate(options).then(user => {
                const products = user.cart.items;
                products.map(prod => {
                    totalPrice += +prod.productId.price * +prod.quantity;
                    quantity += prod.quantity;
                })
                return {totalPrice: totalPrice, quantity: quantity};
            }).then(cart => {
                return res.status(201).json({
                    success: true,
                    message: 'Product added to cart',
                    totalPrice: cart.totalPrice,
                    quantity: cart.quantity
                })
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

module.exports.postMultipleToCart = async (req, res, next) => {
    const user = await User.findById(req._id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'No account found with this id'
        })
    }

    const products = [];
    for (let p of req.body.items) {
        await Product.findById(p.productId)
        .then(product => {
            if(product)  {
                products.push(p);
            }
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    }
    await user.addMultipleToCart(products);
    return res.status(201).json({
        success: true,
        messsage: 'All products added to cart'
    });
};

module.exports.getCart = async (req, res, next) => {
    const user = await User.findById(req._id);
    if(!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        })
    }
    const options = {
        path: 'cart.items.productId'
    };

    user.populate(options).then(user => {
            const products = user.cart.items;
            return res.status(200).json({
                success: true,
                message: 'Cart fetched successfully!',
                products: products
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

module.exports.postCartDeleteProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    const user = await User.findById(req._id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        })
    }
    user.removeFromCart(prodId)
        .then(result => {
            return res.status(201).json({
                success: true,
                message: 'Cart Updated'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};