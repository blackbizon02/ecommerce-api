
const createTokenUser = (user) => {
    const userToken = {
        name: user.name,
        id: user._id,
        role: user.role
    }
    return userToken
}

module.exports = createTokenUser