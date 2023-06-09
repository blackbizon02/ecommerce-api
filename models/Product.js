const mongoose = require('mongoose')
const { Schema } = mongoose

const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        maxLength: 50,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        default: 0
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
        maxLength: 1000
    },
    image: {
        type: String,
        default: '/uploads/example.jpeg'
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: ['office', 'kitchen', 'bedroom']
    },
    company: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: '{VALUE} in not supported'
        }
    },
    colors: {
        type: [String],
        default: ['#222'],
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    inventory: {
        type: Number,
        required: true,
        default: 15
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false
})

ProductSchema.pre('deleteOne', { document: true, query: false }, async function () {
    await this.model("Review").deleteMany({ product: this._id })
})

module.exports = mongoose.model('Product', ProductSchema)