const Role = require('../models/role')
const mongoose = require('mongoose')

//CREATE skill
const createRole = async(req, res)=>{
    const {roleName, accessName} = req.body
    
    //check empty fields
    let emptyFields = []

    if(!roleName){
        emptyFields.push('roleName')
    }

    if(!accessName){
        emptyFields.push('accessName')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        
        //create query
        const role = await Role.create({
            roleName,
            accessName
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
const getOneSkill = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skill = await Skill.findById({_id: id})

    //check if not existing
    if (!skill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json(skill)   

}

//UPDATE skill
const updateSkill = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const skill = await Skill.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!skill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json(skill)
}

//DELETE skill
const deleteSkill = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skill = await Skill.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!skill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json(skill)

}

module.exports = {
    createRole,
    getAllRole,
    getOneSkill,
    updateSkill,
    deleteSkill
}