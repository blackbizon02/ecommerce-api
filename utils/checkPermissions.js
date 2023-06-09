const CustomError = require('../errors')

const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === 'admin') return;
    if (requestUser.id === resourceUserId.toString()) return;
    throw new CustomError.UnauthorizedError('not Authorized to access this route!...')
}

module.exports = checkPermissions