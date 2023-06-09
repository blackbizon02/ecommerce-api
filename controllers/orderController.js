const Order = require('../models/Order')
const Product = require('../models/Product')
const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const { checkPermissions } = require('../utils')

const fakeStripe = async ({ amount, currency }) => {
    const clientSecret = 'fakeClientSecret'
    return { clientSecret, amount }
}

const getAllOrders = async (req, res) => {
    const orders = await Order.find({})

    res.status(StatusCodes.OK).json({ orders })
}

const getSingleOrder = async (req, res) => {
    const { id } = req.params
    const order = await Order.findOne({ _id: id })

    if (!order) {
        throw new CustomError.NotFoundError(`No order with id: ${id} found!...`)
    }
    checkPermissions(req.user, order.user)

    res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.findOne({ _id: req.user.id })

    res.status(StatusCodes.OK).json({ orders })
}

const createOrder = async (req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body
    if (!cartItems || cartItems.length < 1) {
        throw new CustomError.BadRequestError('No cart items provided')
    }
    if (!tax || !shippingFee) {
        throw new CustomError.BadRequestError('please provide tax and shipping fee')
    }

    let orderItems = []
    let subtotal = 0

    for (const item of cartItems) {
        const dbProduct = await Product.findOne({ _id: item.product })
        if (!dbProduct) {
            throw new CustomError.NotFoundError(`No product with id: ${item.product} found!...`)
        }
        const { name, price, image, _id } = dbProduct
        console.log(name, price, image);

        const singleOrderItem = {
            amount: item.amount,
            name, price, image,
            product: _id
        }
        orderItems = [...orderItems, singleOrderItem]
        subtotal += item.amount * price
    }

    const total = tax + shippingFee + subtotal;

    const paymentIntent = await fakeStripe({
        amount: total,
        currency: 'usd'
    })

    const order = await Order.create({
        tax,
        shippingFee,
        subtotal,
        total,
        orderItems,
        user: req.user.id,
        clientSecret: paymentIntent.clientSecret
    })

    res.status(StatusCodes.CREATED).json({ order })
}

const updateOrder = async (req, res) => {
    const { id } = req.params
    const { paymentIntentId } = req.body
    const order = await Order.findOne({ _id: id })

    if (!order) {
        throw new CustomError.NotFoundError(`No order with id: ${id} found!...`)
    }
    checkPermissions(req.user, order.user)

    order.paymentId = paymentIntentId
    order.status = 'paid'

    await order.save()

    res.status(StatusCodes.OK).json({ order })
}

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder
}