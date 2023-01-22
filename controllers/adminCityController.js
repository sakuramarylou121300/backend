const City = require('../models/adminCity') 
const mongoose = require('mongoose')

//CREATE prov exp
const createCity = async(req, res)=>{

    try{
        const {city, province_id} = req.body

        // const adminCity = await City.findOne({city})
        // if(adminCity) return res.status(400).json({messg: 'This city already exists.'})

        const existingCity = await City.findOne({ city, province_id });
        if (existingCity) {
            return res.status(400).json({ message: "City already exists in this province" });
        }
        
        //create new skill
        const newCity = new City({city, province_id})
        await newCity.save()
        res.status(200).json(newCity)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//GET all prov
const getAllProvCity = async(req, res)=>{
    try{
        const city = await City.find({province_id: req.body.province_id}).sort({createdAt: -1})
        .populate('province_id')
        res.status(200).json(city)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET all prov
const getAllCity = async(req, res)=>{
    try{
        const city = await City.find({}).sort({createdAt: -1}).populate('province_id')
        res.status(200).json(city)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET one prov
const getOneCity = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const city = await City.findById({_id: id}).populate('province_id')

    //check if not existing
    if (!city){
        return res.status(404).json({error: 'City not found'})
    }

    res.status(200).json(city)   
}

//UPDATE prov
const updateCity = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const city = await City.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!city){
        return res.status(404).json({error: 'City not found'})
    }

    res.status(200).json(city)//nadagdag
}

//DELETE skill
const deleteCity = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const city = await City.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!city){
        return res.status(404).json({error: 'City not found'})
    }

    res.status(200).json(city)

}
module.exports = {
    createCity,
    getAllCity,
    getAllProvCity, 
    getOneCity,
    updateCity,
    deleteCity
}