const SkilledBClearance = require('../models/skilledBClearance') //for CRUD of skill (admin)
const SkilledInfo = require('../models/skilledInfo')
const mongoose = require('mongoose')

const createSkilledBClearance = async(req, res)=>{

    try{
        const {bClearancePhoto,
                bClearanceExp} = req.body
        const skilled_id = req.skilledInfo._id
        //search if existing
        const skilledBClearanceCheck = await SkilledBClearance.findOne({
            bClearancePhoto:bClearancePhoto,
            bClearanceExp:bClearanceExp,
            isDeleted: 0,
            skilled_id:skilled_id
        })

        if(skilledBClearanceCheck){
            return res.status(400).json({error: "Barangay Clearance already exists."})
        }
        //create new skill
        const newSkilledBClearance = new SkilledBClearance({
            bClearancePhoto,
            bClearanceExp,
            skilled_id})
        await newSkilledBClearance.save()
        res.status(200).json(newSkilledBClearance)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

const getAllSkilledBClearance = async(req, res)=>{
    try{
        const skilledBClearance = await SkilledBClearance.find({isDeleted: 0}).sort({createdAt:-1})
        res.status(200).json(skilledBClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET one skill
const getOneSkilledBClearance = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skilledBClearance = await SkilledBClearance.findById({_id: id})

    //check if not existing
    if (!skilledBClearance){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }

    res.status(200).json(skilledBClearance)   

}

//UPDATE skill
const updateSkilledBClearance  = async(req, res) =>{
    const {id} = req.params    
    const {bClearancePhoto,
            bClearanceExp} = req.body
            const skilled_id = req.skilledInfo._id
            //search if existing
            const skilledBClearanceCheck = await SkilledBClearance.findOne({
                bClearancePhoto:bClearancePhoto,
                bClearanceExp:bClearanceExp,
                isDeleted: 0,
                skilled_id:skilled_id
            })
    
            if(skilledBClearanceCheck){
                return res.status(400).json({error: "Barangay Clearance already exists."})
            }
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
     //delete query
     const skilledBClearance = await SkilledBClearance.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!skilledBClearance){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }

    res.status(200).json(skilledBClearance)
}

//DELETE skill
const deleteSkilledBClearance = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skilledBClearance = await SkilledBClearance.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!skilledBClearance){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }

    res.status(200).json(skilledBClearance)

}

module.exports = {
    createSkilledBClearance,
    getAllSkilledBClearance,
    getOneSkilledBClearance,
    updateSkilledBClearance,
    deleteSkilledBClearance
}