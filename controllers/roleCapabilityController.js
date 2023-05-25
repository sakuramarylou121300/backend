const RoleCapability = require('../models/roleCapability')
const Capability = require('../models/capability')
const AdminInfo = require('../models/adminInfo')

const mongoose = require('mongoose')

//CREATE skill
const createRoleCapability = async(req, res)=>{
    const {capability_id, adminInfo_id} = req.body
    
    //check empty fields
    let emptyFields = []
    
    // if(!role_id){
    //     emptyFields.push('role_id')
    // }
    if(!capability_id){
        emptyFields.push('capability_id')
    }
    if(!adminInfo_id){
        emptyFields.push('adminInfo_id')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        const roleCapabilityCheck = await RoleCapability.findOne({
            // role_id: role_id,
            capability_id: capability_id,
            adminInfo_id: adminInfo_id,
            isDeleted: 0
        })
        
        if(roleCapabilityCheck){
            return res.status(400).json({error: "This role with the same capability already assigned to admin"})
        }
        //create query
        const roleCapability = await RoleCapability.create({
            // role_id,
            capability_id,
            adminInfo_id
        })
        res.status(200).json(roleCapability)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all skill
const getAllRoleCapability = async(req, res)=>{

    try{
        //get all query
        const roleCapability = await RoleCapability.find({isDeleted: 0}).sort({adminInfo_id: -1})
        // .populate('role_id')
        .populate('capability_id')
        .populate('adminInfo_id')
        res.status(200).json(roleCapability)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const getAllCapability = async(req, res)=>{
    const username = req.params.username;
    try{
        // Find skilled_id document based on username
        const adminIdDoc = await AdminInfo
        .findOne({ username: username });

        // Check if skilled_id exists for the given username
        if (!adminIdDoc) {
        return res.status(404).json({ error: 'Admin not found' });
        }
        //get all query
        const roleCap = await RoleCapability.find({
            adminInfo_id: adminIdDoc._id,
            isDeleted: 0,
        })
        .sort({updatedAt: -1})

        .populate({
            path: 'capability_id',
            model: 'Capability',
            select: 'capabilityName', 
            options: { lean: true },
        })
    
        res.status(200).json(roleCap)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skill
const getOneRoleCapability = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const roleCapability = await RoleCapability.findById({_id: id})

    //check if not existing
    if (!roleCapability){
        return res.status(404).json({error: 'RoleCapability not found'})
    }

    res.status(200).json(roleCapability)   

}

//UPDATE skill
const updateRoleCapability = async(req, res) =>{
    const {id} = req.params    
    const {capability_id, adminInfo_id} = req.body
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    try{
        const roleCapabilityCheck = await RoleCapability.findOne({
        // role_id,
        capability_id,
        adminInfo_id
    })
    
    if(roleCapabilityCheck){
        return res.status(400).json({error: "This role with the same capability already assigned to admin"})
    }

     const roleCapability = await RoleCapability.findOneAndUpdate({_id: id},{
        // role_id,
        capability_id,
        adminInfo_id
        //  ...req.body //get new value
     })
     res.status(200).json(roleCapability)
    }

    catch(error){
        res.status(404).json({error: error.message})
    } 
}

//DELETE skill
const deleteRoleCapability = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //check for adminInfo isMainAdmin
    const roleCapability = await RoleCapability.findById(id)
    //check if not existing
    if (!roleCapability){
        return res.status(404).json({error: 'Role Capability not found'})
    }

     roleCapability.isDeleted = 1;
     const adminInfo = await AdminInfo.findById(roleCapability.adminInfo_id)
     if (adminInfo.isMainAdmin === 1) {
         return res.status(400).json({ error: "Cannot delete role capability from main admin account" });
     }
 
     //delete query
     await roleCapability.save();

    res.status(200).json(roleCapability)

}

module.exports = {
    createRoleCapability,
    getAllRoleCapability,
    getAllCapability,
    getOneRoleCapability,
    updateRoleCapability,
    deleteRoleCapability
}