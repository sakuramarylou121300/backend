const jwt = require('jsonwebtoken')
const AdminInfo = require('../models/adminInfo')

const adminAuth = async (req, res, next) =>{
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
        req.adminInfo = await AdminInfo.findOne({_id}).select('_id')
        next()
    }
    catch(error){
        console.log(error)
        res.status(401).json({error: 'Request is not authorized'})
    }
}

module.exports = adminAuth