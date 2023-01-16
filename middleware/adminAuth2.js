const AdminInfo = require('../models/adminInfo')

const adminAuth2 = async(req, res, next) =>{
    try{
        const adminInfo = await AdminInfo.findOne({_id:req.adminInfo.id})
        if(adminInfo.isMainAdmin === 0)
            return res.status(400).json({messg: 'Admin access denied.'})
            next()
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

module.exports = adminAuth2