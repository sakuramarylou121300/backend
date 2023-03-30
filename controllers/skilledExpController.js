const mongoose = require('mongoose')
const SkilledExp = require('../models/skilledExp') 
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")

const createExp = async(req, res) => {
  const { categorySkill,
    isHousehold,
    company,
    isWorking,
    workStart,
    workEnd,
    refLname,
    refFname,
    refMname,
    refPosition,
    refOrg,
    refContactNo} = req.body;

  try {
    const skilled_id = req.skilledInfo._id;
    let uploadedPhotos = [];

    // Loop through uploaded files and upload to cloudinary
    for (let file of req.files) {
      let result = await cloudinary.uploader.upload(file.path);
      uploadedPhotos.push({ url: result.secure_url, public_id: result.public_id });
    }
    // console.log(result)
    console.log(req.files)

    // const uploadedPhotos = await Promise.all(
    //   req.files.map(async (file) => {
    //     const result = await cloudinary.uploader.upload(file.path);
    //     return { url: result.secure_url, public_id: result.public_id };
    //   })
    // );

    // Create new SkilledExp object
    let skilledExp = new SkilledExp({
        categorySkill,
        isHousehold,
        company,
        isWorking,
        workStart,
        workEnd,
        refLname,
        refFname,
        refMname,
        refPosition,
        refOrg,
        refContactNo,
        skilled_id,
        photo: uploadedPhotos,
        cloudinary_id: uploadedPhotos[0].public_id // Use the public ID of the first photo in the array
    });
    console.log(skilledExp)
    await skilledExp.save();
    res.status(200).json(skilledExp);
  } catch(error) {
    console.log(error)
    res.status(404).json({error: error.message});
  }
}

// GET all address
const getAllExp = async(req, res)=>{

    try{
        //this is to find contact for specific user
        const skilled_id = req.skilledInfo._id

        //get all query
        const skilledExp = await SkilledExp.find({skilled_id, isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id')
        res.status(200).json(skilledExp)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
} 

//GET one skill exp
const getOneExp = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const skilledExp = await SkilledExp.findById({_id: id})

    //check if not existing
    if (!skilledExp){
        return res.status(404).json({error: 'Skill Experience not found'}) 
    }

    res.status(200).json(skilledExp)   
}

const updateExp = async (req, res) => {
    try {
      const skilledExp = await SkilledExp.findById(req.params.id);
  
      // remove the recent images
      await Promise.all(
        skilledExp.photo.map(async (expPhoto) => {
          await cloudinary.uploader.destroy(expPhoto.public_id);
        })
      );
  
      // upload the new images
      let uploadedPhotos = await Promise.all(
        req.files.map(async (file) => {
          let result = await cloudinary.uploader.upload(file.path);
          return { url: result.secure_url, public_id: result.public_id };
        })
      );
  
      let data = {
        categorySkill: req.body.categorySkill || skilledExp.categorySkill,
        isHousehold: req.body.isHousehold || skilledExp.isHousehold,
        company: req.body.company || skilledExp.company,
        isWorking: req.body.isWorking || skilledExp.isWorking,
        workStart: req.body.workStart || skilledExp.workStart,
        workEnd: req.body.workEnd || skilledExp.workEnd,
        refLname: req.body.refLname || skilledExp.refLname,
        refFname: req.body.refFname || skilledExp.refFname,
        refMname: req.body.refMname || skilledExp.refMname,
        refPosition: req.body.refPosition || skilledExp.refPosition,
        refOrg: req.body.refOrg || skilledExp.refOrg,
        refContactNo: req.body.refContactNo || skilledExp.refContactNo,
        photo: uploadedPhotos.length > 0 ? uploadedPhotos : skilledExp.photo,
        cloudinary_id: uploadedPhotos.length > 0 ? uploadedPhotos[0].public_id : skilledExp.cloudinary_id,
      };
  
      const updatedSkilledExp = await SkilledExp.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true }
      );
  
      res.json(updatedSkilledExp);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

//DELETE skill cert
const deleteExp = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const skilledExp = await SkilledExp.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!skilledExp){
        return res.status(404).json({error: 'Skilled Experience not found'})
    }

    res.status(200).json(skilledExp)

}
module.exports = {
    createExp,
    getAllExp,
    getOneExp, 
    updateExp,
    deleteExp
}