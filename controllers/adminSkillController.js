const AdminSkill = require('../models/adminSkill') //for CRUD of skill (admin)
const SkilledInfo = require('../models/skilledInfo')
const ClientInfo = require('../models/clientInfo')
const SkilledNotification = require('../models/skilledNotification')
const ClientNotification = require('../models/clientNotification')
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

        //notification for all 
        // Fetch all skilled workers and clients
        const skilledWorkers = await SkilledInfo.find();
        const clients = await ClientInfo.find();
 
        // Create notifications for all skilled workers
        for (const skilledWorker of skilledWorkers) {
            await SkilledNotification.create({
                skilled_id: skilledWorker._id,
                message: `${skill} is added in the list of skills.`,
                urlReact: `/Profile/Setting`,
            });
        }

        // Create notifications for all clients
        for (const client of clients) {
            await ClientNotification.create({
                client_id: client._id,
                message: `${skill} is added in the list of skills.`,
                urlReact: `/`,
            });
        }
  
        res.status(200).json({message: "Successfully added."})
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

    //update
    const checkAdminSkill = await AdminSkill.findOne({skill})
        if(checkAdminSkill) return res.status(400).json({error: 'This skill already exists.'})
        
    //value of previous skill
    const findSkillPreValue = await AdminSkill.findOne({_id: id})
    const skillPreValue = findSkillPreValue.skill
    // console.log(skillPreValue)

     //delete query
     const adminSkill = await AdminSkill.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!adminSkill){
        return res.status(404).json({error: 'Skill not found'})
    }

    //notification for all 
    // Fetch all skilled workers and clients
    const skilledWorkers = await SkilledInfo.find();
    const clients = await ClientInfo.find();

    // Create notifications for all skilled workers
    for (const skilledWorker of skilledWorkers) {
        await SkilledNotification.create({
            skilled_id: skilledWorker._id,
            message: `${skillPreValue} is updated to  ${skill}.`,
            urlReact: `/Profile/Setting`,
        });
    }

    // Create notifications for all clients
    for (const client of clients) {
        await ClientNotification.create({
            client_id: client._id,
            message: `${skillPreValue} is updated to  ${skill}.`,
            urlReact: `/`,
        });
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