const ClientInfo = require('../models/clientInfo')

const clientVerified = async(req, res, next) =>{
    try{
        const clientInfo = await ClientInfo.findOne({_id:req.clientInfo.id})
        if(clientInfo.userIsVerified === 0)
            return res.status(400).json({messg: 'Cannot view skilled worker. Please check if your baranggay clearance, nbi clearance and address are verified.'})
            next()
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

module.exports = clientVerified