const AdminRoleCapability = require('../models/adminRoleCapability')
const mongoose = require('mongoose')

//CREATE skill
const createAdminRoleCapability = async(req, res)=>{
    const {roleCapability_id, adminInfo_id} = req.body
    
    //check empty fields
    let emptyFields = []
    if(!roleCapability_id){
        emptyFields.push('roleCapability_id')
    }
    if(!adminInfo_id){
        emptyFields.push('adminInfo_id')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        //create query
        const adminRoleCapability = await AdminRoleCapability.create({
            roleCapability_id,
            adminInfo_id
        })
        res.status(200).json(adminRoleCapability)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all skill
const getAllAdminRoleCapability = async(req, res)=>{

    try{
        //get all query
        const adminRoleCapability = await AdminRoleCapability.find({}).sort({createdAt: -1})
        .populate('roleCapability_id')
        .populate('adminInfo_id')
        res.status(200).json(adminRoleCapability)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skill
const getOneAdminRoleCapability = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const adminRoleCapability = await AdminRoleCapability.findById({_id: id})

    //check if not existing
    if (!adminRoleCapability){
        return res.status(404).json({error: 'adminRoleCapability not found'})
    }

    res.status(200).json(adminRoleCapability)   

}

//UPDATE skill
const updateAdminRoleCapability = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const adminRoleCapability = await AdminRoleCapability.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!adminRoleCapability){
        return res.status(404).json({error: 'adminRoleCapability not found'})
    }

    res.status(200).json(adminRoleCapability)
}

//DELETE skill
const deleteAdminRoleCapability = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const adminRoleCapability = await AdminRoleCapability.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!adminRoleCapability){
        return res.status(404).json({error: 'adminRoleCapability not found'})
    }

    res.status(200).json(adminRoleCapability)

}

module.exports = {
    createAdminRoleCapability,
    getAllAdminRoleCapability,
    getOneAdminRoleCapability,
    updateAdminRoleCapability,
    deleteAdminRoleCapability
}