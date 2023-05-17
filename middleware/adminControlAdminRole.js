const mongoose = require('mongoose');
const AdminInfo = require('../models/adminInfo')

const adminControlAdminRole = async(req, res, next) =>{
    try{
        const adminInfo = await AdminInfo.findOne({_id:req.adminInfo.id}).populate('roleCapabality')
        // console.log(adminInfo)
        let hasAccess = adminInfo.roleCapabality.some(capability => capability.capability_id.toString() === "63c3c1e5ab4422b3bb595f3c")
        if(!hasAccess)
            return res.status(400).json({messg: 'Admin access denied.'})
        next()
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

module.exports = adminControlAdminRole