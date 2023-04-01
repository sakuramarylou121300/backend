const SkilledBClearance = require('../models/skilledBClearance') //for CRUD of skill (admin)
const SkilledInfo = require('../models/skilledInfo')
const cloudinary = require("../utils/cloudinary")
const mongoose = require('mongoose')
 
const createSkilledBClearance = async(req, res)=>{

    try{
        const {bClearanceExp} = req.body
        const skilled_id = req.skilledInfo._id
        //check empty fields
        let emptyFields = []

        if(!bClearanceExp){
            emptyFields.push('bClearanceExp')
        }

        //send message if there is an empty fields
        if(emptyFields.length >0){
            return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
        }
        //search if existing
        const skilledBClearanceCheck = await SkilledBClearance.findOne({
            bClearanceExp:bClearanceExp,
            bClearanceIsVerified:{$in: [0, 1]},
            isDeleted: 0,
            skilled_id:skilled_id
        })

        if(skilledBClearanceCheck){
            return res.status(400).json({error: "Barangay Clearance already exists."})
        }
        result = await cloudinary.uploader.upload(req.file.path)
        let skilledBClearance = new SkilledBClearance({
            bClearanceExp,          
            photo: result.secure_url,     
            cloudinary_id: result.public_id,
            skilled_id
        })
        await skilledBClearance.save()
        console.log(skilledBClearance)
        res.status(200).json(skilledBClearance)
    
    }
    catch(error){
        console.log(error)
        res.status(404).json({error: error.message})
    }
}

const getAllSkilledBClearance = async(req, res)=>{
    try{
        const skilled_id = req.skilledInfo._id
        const skilledBClearance = await SkilledBClearance
        .find({skilled_id,isDeleted: 0})
        .sort({createdAt:-1})
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

   try{ 
        let skilledBClearance = await SkilledBClearance.findById(req.params.id)  

        //remove the recent image
        await cloudinary.uploader.destroy(skilledBClearance.cloudinary_id)
        //upload the new image
        let result
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path)
        }
        const data = {
            bClearanceExp: req.body.bClearanceExp || skilledBClearance.bClearanceExp,
            photo: result?.secure_url || skilledBClearance.photo,
            cloudinary_id: result?.public_id || skilledBClearance.cloudinary_id
        }

        skilledBClearance = await SkilledBClearance.findByIdAndUpdate(req.params.id, 
            data, {new: true})
            res.json(skilledBClearance)
    }catch(error){
        res.status(404).json({error:error.message})
    }
    
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