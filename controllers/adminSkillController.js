const AdminSkill = require('../models/adminSkill') //for CRUD of skill (admin)
const Info = require('../models/skilledInfo')
const mongoose = require('mongoose')

//CREATE skill exp
const createSkill = async(req, res)=>{

    try{
        const {skill} = req.body

        //required
        if(skill === ""){
            return res.status(400).json({error: "Please enter skill."})
        }
        //search if existing
        const skillCheck = await AdminSkill.findOne({
            skill:skill,
            isDeleted:0
        })

        if(skillCheck){
            return res.status(400).json({error: "Skill already exists."})
        }

        const skillCheckDeleted = await AdminSkill.findOne({
            skill:skill,
            isDeleted:1
        })

        if(skillCheckDeleted){
            return res.status(400).json({error: `The skill that you have entered has been deleted. Do you want to restore it?`})
        }

        //create new skill
        const newSkill = new AdminSkill({skill})
        await newSkill.save()
        res.status(200).json(newSkill)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all skill
const getAllSkill = async(req, res)=>{
    try{
        const skill = await AdminSkill.find({isDeleted: 0}).sort({skill: 1})
        res.status(200).json(skill)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
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
    const skill = await AdminSkill.findById({_id: id})

    //check if not existing
    if (!skill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json(skill)   

}

//UPDATE skill
const updateSkill = async(req, res) =>{
    const {id} = req.params    
    const {skill} = req.body
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //required
    if(skill === ""){
        return res.status(400).json({error: "Please enter skill."})
    }

    const checkAdminSkill = await AdminSkill.findOne({skill})
        if(checkAdminSkill) return res.status(400).json({messg: 'This skill already exists.'})
        
     //delete query
     const adminSkill = await AdminSkill.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!adminSkill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json({message: 'Successfully updated'})
}

//DELETE skill
const deleteSkill = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const adminSkill = await AdminSkill.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!adminSkill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json(adminSkill)

}

//RESTORE
const getAllSkillDeleted = async(req, res)=>{
    try{
        const { skill } = req.params;
        const adminSkill = await AdminSkill.find({skill, isDeleted: 1}).sort({skill: 1})
        res.status(200).json(adminSkill)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

const restoreSkill = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const adminSkill = await AdminSkill.findOneAndUpdate({_id: id},
        {isDeleted:0})
    
    //check if not existing
    if (!adminSkill){
        return res.status(404).json({error: 'Skill not found'})
    }

    res.status(200).json(adminSkill)

}

module.exports = {
    createSkill,
    getAllSkill,
    getOneSkill,
    updateSkill,
    deleteSkill,
    getAllSkillDeleted,
    restoreSkill
}