const mongoose = require('mongoose');
const AdminInfo = require('../models/adminInfo')

const adminControlClient = async(req, res, next) =>{
    try{
        const adminInfo = await AdminInfo.findOne({_id:req.adminInfo.id}).populate({
            path: 'roleCapabality',
            match: { isDeleted: 0} 
        })
        // console.log(adminInfo)
        let hasAccess = adminInfo.roleCapabality.some(capability => capability.capability_id.toString() === "647a1985cf99c25b2c82e659")
        if(!hasAccess)
            return res.status(400).json({messg: 'Admin access denied.'})
        next()
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

module.exports = adminControlClient