const jwt = require('jsonwebtoken')
const ClientInfo = require('../models/clientInfo')

const clientRequireAuth = async (req, res, next) =>{
    //verify authentication
    const {authorization} = req.headers

    //check if authorization exists
    if (!authorization){
        return res.status(401).json({error: 'Authorirization token required'})
    }

    //split jsonwebtoken
    const token = authorization.split(' ')[1]
    try{
        const {_id} = jwt.verify(token, process.env.SECRET)
        req.clientInfo = await ClientInfo.findOne({_id}).select('_id')

        //if other users tries to bridge the code not for them
        if (!req.clientInfo || !req.clientInfo._id) {
            return res.status(401).json({ error: 'Request is not authorized.' });
        }

        next()
    }
    catch(error){
        res.status(401).json({error: 'Request is not authorized'})
    }
}

const localVariables = async (req, res, next) =>{
    req.app.locals = {
        OTP : null,
        resetSession : false
    }
    next()
}
module.exports = {clientRequireAuth, localVariables}