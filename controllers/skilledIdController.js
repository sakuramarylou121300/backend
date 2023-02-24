const mongoose = require('mongoose')
const SkilledId = require('../models/skilledBarangay') 
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")

const createSkilledId = async(req,res)=>{
    const {barangayExp, nbiExp} = req.body

    try{
        const skilled_id = req.skilledInfo._id
        result = await cloudinary.uploader.upload(req.file.path)

        let skilledId = new SkilledId({
            skilled_id,
            barangayExp,
            barangayPhoto: result.secure_url,
            cloudinary_id: result.public_id,   
        })
        await skilledId.save()
        res.status(200).json(skilledId)
   }
   catch(error){
        res.status(404).json({error: error.message})
    }
}

module.exports = {
    createSkilledId
}