function errHandler(err, req, res, next) {
    if (err.name === 'ValidationError') {
        const valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        return res.status(422).send(valErrors);
    }
    if (err.statusCode === 401 && err.error.code === 'BAD_REQUEST_ERROR') {
        return res.status(401).send({
            success: false,
            message: err.error.description,
        });
    }
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(500).json({
            success: false,
            message: 'Invalid Id'
        })
    }
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid Token'
        })
    }
    return res.status(503).send(err);
}

module.exports = errHandler;