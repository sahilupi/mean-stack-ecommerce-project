const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required']
    },
    description: {
        type: String,
        // required: [true, 'Product description is required']
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        required: [true, 'Product image is required']
    },
    images: [{
        type: String
    }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        // required: [true, 'Product price is required']
    },
    currency: {
        type: String,
        default: "INR"
    },
    category: {
        type: Schema.Types.ObjectId,
        // required: [true, 'Product category is required'],
        ref: 'Category'
    },
    countInStock: {
        type: Number,
        // required: [true, 'Product stock quantity is required'],
        min: 0,
        max: 2555
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});

// productSchema.index({'$**': 'text'});
productSchema.index({name: 'text', 'category.name': 'text'});

productSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true
});

mongoose.model('Product', productSchema);