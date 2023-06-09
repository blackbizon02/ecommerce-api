const Review = require('../models/Review')
const Product = require('../models/Product')
const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const { checkPermissions } = require('../utils')

const createReview = async (req, res) => {
    console.log(req.body)
    const { product: productId } = req.body
    const productExists = await Product.findOne({ _id: productId })

    if (!productExists) {
        throw new CustomError.NotFoundError(`No product with id: ${productId} found...`)
    }

    const userAlreadySubmitted = await Review.findOne({
        product: productId,
        user: req.user.id
    })

    if (userAlreadySubmitted) {
        throw new CustomError.BadRequestError('Already submitted review for this product')
    }


    req.body.user = req.user.id

    const review = await Review.create(req.body)

    res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({}).populate({ path: 'product', select: 'name company price' })

    res.status(StatusCodes.OK).json({ reviews })
}

const getSingleReview = async (req, res) => {
    const { id } = req.params
    const review = await Review.find({ _id: id })
    if (!review) {
        throw new CustomError.NotFoundError(`No review with id: ${id} found!...`)
    }

    res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
    const { id } = req.params
    const { rating, title, comment } = req.body

    const review = await Review.findOne({ _id: id })

    if (!review) {
        throw new CustomError.NotFoundError(`No review with id: ${id} found!...`)
    }

    checkPermissions(req.user, review.user)

    review.title = title;
    review.rating = rating;
    review.comment = comment;

    review.save()

    res.status(StatusCodes.OK).send('Review successfuly updated!...')
}

const deleteReview = async (req, res) => {
    const { id } = req.params

    const review = await Review.findOne({ _id: id })

    if (!review) {
        throw new CustomError.NotFoundError(`No review with id: ${id} found!...`)
    }

    checkPermissions(req.user, review.user)

    await review.deleteOne()

    res.status(StatusCodes.OK).send('Reviev successfully removed!')
}


module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview
}