const { isTokenValid } = require('../utils')
const CustomError = require('../errors')


const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token
    if (!token) {
        throw new CustomError.UnauthenticatedError('Not Authorised!')
    }
    
    try {
        const { name, id, role } = isTokenValid({ token })
        req.user = { name, id, role }
        next()
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Not allowed!')
    }

}

const authorizePermissions = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            throw new CustomError.UnauthorizedError('Unauthorized to access this route')
        }

      next()  
    }
    
}

module.exports = {
    authenticateUser,
    authenticateUser,
    authorizePermissions
}