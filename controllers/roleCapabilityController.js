const RoleCapability = require('../models/roleCapability')
const mongoose = require('mongoose')

//CREATE skill
const createRoleCapability = async(req, res)=>{
    const {role_id, capability_id, adminInfo_id} = req.body
    
    //check empty fields
    let emptyFields = []
    
    if(!role_id){
        emptyFields.push('role_id')
    }
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
        //create query
        const roleCapability = await RoleCapability.create({
            role_id,
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
        const roleCapability = await RoleCapability.find({}).sort({createdAt: -1})
        .populate('adminInfo_id')
        res.status(200).json(roleCapability)
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

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const roleCapability = await RoleCapability.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!roleCapability){
        return res.status(404).json({error: 'RoleCapability not found'})
    }

    res.status(200).json(roleCapability)
}

//DELETE skill
const deleteRoleCapability = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const roleCapability = await RoleCapability.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!roleCapability){
        return res.status(404).json({error: 'RoleCapability not found'})
    }

    res.status(200).json(roleCapability)

}

module.exports = {
    createRoleCapability,
    getAllRoleCapability,
    getOneRoleCapability,
    updateRoleCapability,
    deleteRoleCapability
}