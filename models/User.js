const mongoose = require('mongoose')
const { Schema } = mongoose
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = Schema({
    name: {
        type: String,
        required: [true, 'please provide name'],
        minLength: 3,
        maxLength: 20
    },
    email: {
        type: String,
        required: [true, 'please provide email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email',
            unique: true
        }
    },
    password: {
        type: String,
        required: [true, 'please provide password'],
        minLength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
})

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('User', userSchema)