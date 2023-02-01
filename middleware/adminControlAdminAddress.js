const mongoose = require('mongoose');
const AdminInfo = require('../models/adminInfo')

const adminControlAdminAddress = async(req, res, next) =>{
    try{
        const adminInfo = await AdminInfo.findOne({_id:req.adminInfo.id}).populate({
            path: 'roleCapabality',
            match: { isDeleted: 0} 
        })
        console.log(adminInfo)
        let hasAccess = adminInfo.roleCapabality.some(capability => capability.capability_id.toString() === "63da859585bb5180f0eabba7")
        if(!hasAccess)
            return res.status(400).json({messg: 'Admin access denied.'})
        next()
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

module.exports = adminControlAdminAddress