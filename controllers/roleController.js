const Role = require('../models/role')
const mongoose = require('mongoose')

//CREATE skill
const createRole = async(req, res)=>{
    const {roleName} = req.body
    
    //check empty fields
    let emptyFields = []

    if(!roleName){
        emptyFields.push('roleName')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        const checkRole = await Role.findOne({roleName})
        if(checkRole) return res.status(400).json({messg: 'This role already exists.'})
        
        //create query
        const role = await Role.create({
            roleName,
        })
        res.status(200).json(role)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all skill
const getAllRole = async(req, res)=>{

    try{
        //get all query
        const role = await Role.find({}).sort({createdAt: -1})
        res.status(200).json(role)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skill
const getOneRole = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const role = await Role.findById({_id: id})

    //check if not existing
    if (!role){
        return res.status(404).json({error: 'Role not found'})
    }

    res.status(200).json(role)   

}

//UPDATE skill
const updateRole = async(req, res) =>{
    const {id} = req.params    
    const {roleName} = req.body

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const checkRole = await Role.findOne({roleName})
     if(checkRole) return res.status(400).json({messg: 'This role already exists.'})
     
     const role = await Role.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!role){
        return res.status(404).json({error: 'Role not found'})
    }

    res.status(200).json(role)
}

//DELETE skill
const deleteRole = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const role = await Role.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!role){
        return res.status(404).json({error: 'Role not found'})
    }

    res.status(200).json(role)

}

module.exports = {
    createRole,
    getAllRole,
    getOneRole,
    updateRole,
    deleteRole
}