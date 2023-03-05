const mongoose = require('mongoose')
const SkilledBarangay = require('../models/skilledBarangay') 
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")

const createBarangay = async(req,res)=>{
    const {barangayExp} = req.body

    try{
        const skilled_id = req.skilledInfo._id
        result = await cloudinary.uploader.upload(req.file.path)

        let skilledBarangay = new SkilledBarangay({
            skilled_id,
            barangayExp,
            barangayPhoto: result.secure_url,
            cloudinary_id: result.public_id,   
        })
        await skilledBarangay.save()
        res.status(200).json(skilledBarangay)
   }
   catch(error){
        res.status(404).json({error: error.message})
    }
}
//GET all address
const getAllBarangay = async(req, res)=>{

    try{
        //this is to find contact for specific user
        const skilled_id = req.skilledInfo._id

        //get all query
        const skilledBarangay = await SkilledBarangay.find({skilled_id, isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id')
        res.status(200).json(skilledBarangay)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const updateBarangay = async(req,res)=>{
    // const {id} = req.params  

    try{
        // const skilled_id = req.skilledInfo._id
        let skilledBarangay = await SkilledBarangay.findById(req.params.id)
        
        //remove the recent image
        await cloudinary.uploader.destroy(skilledBarangay.cloudinary_id)
        //upload the new image
        let result
        if(req.file){
            result = await cloudinary.uploader.upload(req.file.path)
        }
        const data = {
            barangayExp: req.body.barangayExp || skilledBarangay.barangayExp,
            barangayPhoto: result?.secure_url || skilledBarangay.barangayPhoto,
            cloudinary_id: result?.public_id || skilledBarangay.cloudinary_id
        }

        skilledBarangay = await SkilledBarangay.findByIdAndUpdate(req.params.id, 
            data, {new: true})
            res.json(skilledBarangay)
   }
   catch(error){
        res.status(404).json({error: error.message})
    }
}

//DELETE skill cert
const deleteBarangay = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skilledBarangay = await SkilledBarangay.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!skilledBarangay){
        return res.status(404).json({error: 'Barangay Clearance not found'})
    }

    res.status(200).json(skilledBarangay)

}
module.exports = {
    createBarangay,
    getAllBarangay,
    updateBarangay, 
    deleteBarangay
}