const SkilledNClearance = require('../models/skilledNClearance') //for CRUD of skill (admin)
const SkilledInfo = require('../models/skilledInfo')
const cloudinary = require("../utils/cloudinary");
const mongoose = require('mongoose')

const createSkilledNClearance = async(req, res)=>{

    try{
        const {nClearanceExp} = req.body
        const skilled_id = req.skilledInfo._id
        let emptyFields = []

        if(!nClearanceExp){
            emptyFields.push('nClearanceExp')
        }

        //send message if there is an empty fields
        if(emptyFields.length >0){
            return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
        }
        //search if existing
        const skilledNClearanceCheck = await SkilledNClearance.findOne({
            nClearanceExp:nClearanceExp,
            nClearanceIsVerified:{$in: [0, 1]},
            isDeleted: 0,
            skilled_id:skilled_id
        })

        if(skilledNClearanceCheck){
            return res.status(400).json({error: "NBI Clearance already exists."})
        }
        //create new skill
        result = await cloudinary.uploader.upload(req.file.path)
        let skilledNClearance = new SkilledNClearance({
            nClearanceExp,
            photo: result.secure_url,     
            cloudinary_id: result.public_id,
            skilled_id
        })
        await skilledNClearance.save()
        console.log(skilledNClearance)

        res.status(200).json(skilledNClearance)
    }
    catch(error){
        console.log(error)
        res.status(404).json({error: error.message})
    }
}

const getAllSkilledNClearance = async(req, res)=>{
    try{
        const skilled_id = req.skilledInfo._id
        const skilledNClearance = await SkilledNClearance
        .find({skilled_id,isDeleted: 0})
        .sort({createdAt:-1})
        res.status(200).json(skilledNClearance)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET one skill
const getOneSkilledNClearance = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skilledNClearance = await SkilledNClearance.findById({_id: id})

    //check if not existing
    if (!skilledNClearance){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }

    res.status(200).json(skilledNClearance)   

}

//UPDATE skill
const updateSkilledNClearance  = async(req, res) =>{

    try{ 
        let skilledNClearance = await SkilledNClearance.findById(req.params.id)  
    
        //remove the recent image
        await cloudinary.uploader.destroy(skilledNClearance.cloudinary_id)
        //upload the new image
        let result
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path)
        }
        const data = {
            nClearanceExp: req.body.nClearanceExp || skilledNClearance.nClearanceExp,
            photo: result?.secure_url || skilledNClearance.photo,
            cloudinary_id: result?.public_id || skilledNClearance.cloudinary_id
        }

        skilledNClearance = await SkilledNClearance.findByIdAndUpdate(req.params.id, 
            data, {new: true})
            res.json(skilledNClearance)
    }
    catch(error){
        res.status(404).json({error:error.message})
    }
}

//DELETE skill
const deleteSkilledNClearance = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skilledNClearance = await SkilledNClearance.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!skilledNClearance){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }

    res.status(200).json(skilledNClearance)

}

module.exports = {
    createSkilledNClearance,
    getAllSkilledNClearance,
    getOneSkilledNClearance,
    updateSkilledNClearance,
    deleteSkilledNClearance
}