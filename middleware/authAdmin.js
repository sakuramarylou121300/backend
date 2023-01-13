const SkilledInfo = require('../models/skilledInfo')

const authAdmin = async(req, res, next) =>{
    try{
        const skilledInfo = await SkilledInfo.findOne({_id:req.skilledInfo.id})
        if(skilledInfo.role === 0)
            return res.status(400).json({messg: 'Admin access denied.'})
            next()
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

module.exports = authAdmin