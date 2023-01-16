const mongoose = require('mongoose');
const AdminInfo = require('../models/adminInfo')

const adminControlAdminSkill = async(req, res, next) =>{
    try{
        const adminInfo = await AdminInfo.findOne({_id:req.adminInfo.id}).populate('roleCapabality')
        console.log(adminInfo)
        let hasAccess = adminInfo.roleCapabality.some(capability => capability.capability_id.toString() === "63c54671ae6d45453aaf0b4c")
        if(!hasAccess)
            return res.status(400).json({messg: 'Admin access denied.'})
        next()
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

module.exports = adminControlAdminSkill