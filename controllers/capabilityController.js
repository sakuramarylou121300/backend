const Capability = require('../models/capability')
const mongoose = require('mongoose')

//CREATE skill
const createCapability = async(req, res)=>{
    const {capabilityName} = req.body
    
    //check empty fields
    let emptyFields = []

    if(!capabilityName){
        emptyFields.push('capabilityName')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        
        //create query
        const capability = await Capability.create({
            capabilityName,
        })
        res.status(200).json(capability)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all skill
const getAllCapability = async(req, res)=>{

    try{
        //get all query
        const capability = await Capability.find({}).sort({createdAt: -1})
        res.status(200).json(capability)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET one skill
const getOneCapability = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const capability = await Capability.findById({_id: id})

    //check if not existing
    if (!capability){
        return res.status(404).json({error: 'Capability not found'})
    }

    res.status(200).json(capability)   

}

//UPDATE skill
const updateCapability = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const capability = await Capability.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!capability){
        return res.status(404).json({error: 'Capability not found'})
    }

    res.status(200).json(capability)
}

//DELETE skill
const deleteCapability = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const capability = await Capability.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!capability){
        return res.status(404).json({error: 'Capability not found'})
    }

    res.status(200).json(capability)

}

module.exports = {
    createCapability,
    getAllCapability,
    getOneCapability,
    updateCapability,
    deleteCapability
}