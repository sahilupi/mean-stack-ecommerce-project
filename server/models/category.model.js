const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required']
    },
    color: {
        type: String,
        default: '#333'
    },
    icon: {
        type: String
    }
}, {
    timestamps: true
});

mongoose.model('Category', categorySchema);