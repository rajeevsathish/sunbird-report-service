const setApiResponseId = (id) => (req, res, next) => {
    req.id = id || 'api.report'
    next();
}

module.exports = {
    setApiResponseId
}