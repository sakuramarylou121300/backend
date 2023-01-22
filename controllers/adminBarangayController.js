const Barangay = require('../models/adminBarangay') 
const mongoose = require('mongoose')

//CREATE prov exp
const createBarangay = async(req, res)=>{

    try{
        const {barangay, city_id} = req.body
        
        const existingBarangay = await Barangay.findOne({ barangay, city_id });
        if (existingBarangay) {
            return res.status(400).json({ message: "Barangay already exists in this city" });
        }

        //create new skill
        const newBarangay = new Barangay({barangay, city_id})
        await newBarangay.save()
        res.status(200).json(newBarangay)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all prov
const getCityBarangay = async(req, res)=>{
    try{
        const barangay = await Barangay.find({city_id: req.body.city_id}).sort({createdAt: -1})
        .populate('city_id')
        res.status(200).json(barangay)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET all prov
const getAllBarangay = async(req, res)=>{
    try{
        const barangay = await Barangay.find({}).sort({createdAt: -1}).populate('city_id')
        res.status(200).json(barangay)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET one prov
const getOneBarangay = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const Barangay = await Barangay.findById({_id: id})

    //check if not existing
    if (!Barangay){
        return res.status(404).json({error: 'Barangay not found'})
    }

    res.status(200).json(Barangay)   
}

//UPDATE prov
const updateBarangay = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const Barangay = await Barangay.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!Barangay){
        return res.status(404).json({error: 'Barangay not found'})
    }

    res.status(200).json(Barangay)//nadagdag
}

//DELETE skill
const deleteBarangay = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const Barangay = await Barangay.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!Barangay){
        return res.status(404).json({error: 'Barangay not found'})
    }

    res.status(200).json(Barangay)

}
module.exports = {
    createBarangay,
    getCityBarangay,
    getAllBarangay,
    getOneBarangay,
    updateBarangay,
    deleteBarangay
}