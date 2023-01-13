const Skill = require('../models/skill')
// const Info = require('../models/skilledInfo')
const AdminInfo = require('../models/adminInfo')
const mongoose = require('mongoose')

//CREATE skill
const createSkill = async(req, res)=>{
    const {skillName} = req.body
    
    //check empty fields
    let emptyFields = []
    
    if(!skillName){
        emptyFields.push('skillName')
    }

    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{
        //this is to assign the job to a specific client user, get id from clientInfo
        const skilled_id = req.skilledInfo._id
        
        //create query
        const skill = await Skill.create({
            skillName,
            skilled_id
        })
        res.status(200).json(skill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all skill
const getAllSkill = async(req, res)=>{

    try{
        //this is to find skill for specific user
        const skilled_id = req.skilledInfo._id
        //get all query
        const skill = await Skill.find({skilled_id}).sort({createdAt: -1}).populate('skilled_id')
        res.status(200).json(skill)
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
    createSkill,
    getAllSkill,
    getOneSkill,
    updateSkill,
    deleteSkill
}