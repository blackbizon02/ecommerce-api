require('dotenv').config()
require('express-async-errors')

//express
const express = require('express')
const app = express()

//rest of the packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileupload = require('express-fileupload')

const ratelimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
const cors = require('cors')

//connectDb
const connectDB = require('./db/connect')

//routers
const authRouter = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')

//middleware
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.set('trust proxy', 1)
app.use(ratelimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 5 create account requests per `window` (here, per hour)
    message:
        'Too many accounts created from this IP, please try again after an hour'
}))
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('./public'))
app.use(fileupload())


//routes
app.get('/api/v1', (req, res) => {
    console.log(req.signedCookies)
    res.send('home page')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()