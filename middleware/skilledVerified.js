const SkilledInfo = require('../models/skilledInfo')

const skilledVerified = async(req, res, next) =>{
    try{
        const skilledInfo = await SkilledInfo.findOne({_id:req.skilledInfo.id})
        if(skilledInfo.userIsVerified === 0)
            return res.status(400).json({messg: 'Cannot view client. Please check if your baranggay clearance, nbi clearance and address are verified.'})
            next()
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

module.exports = skilledVerified