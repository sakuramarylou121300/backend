const City = require('../models/adminCity')  
const mongoose = require('mongoose')

//CREATE prov exp
const createCity = async(req, res)=>{

    try{
        const {city, province_id} = req.body

        const cityCheck = await City.findOne({
            city:city,
            province_id:province_id,
            isDeleted: 0
        })

        if(cityCheck){
            return res.status(400).json({error: "City already exists."})
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
    const province_id = req.params.province_id;
    try{
        const city = await City.find({province_id:province_id}).sort({createdAt: -1})
        .populate('province_id')
        // .populate('province_id').sort({ 'province_id.province': 1 })
        res.status(200).json(city)
    }
    catch(err){
        return res.status(500).json({messg: err.message})
    }
}

//GET all prov
const getAllCity = async(req, res)=>{
    try{
        const city = await City.find({isDeleted: 0})
        .populate('province_id')
        .sort({province_id: 1 })
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
const updateCityProvince = async(req, res) =>{
    const {id} = req.params    
    const {city, province_id} = req.body

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    const existingCity = await City.findOne({ city, province_id });
        if (existingCity) {
            return res.status(400).json({ message: "City already exists in this province" });
        }
     //delete query
     const adminCity = await City.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!adminCity){
        return res.status(404).json({error: 'City not found'})
    }

    res.status(200).json(adminCity)//nadagdag
}

//UPDATE prov
const updateCity = async(req, res) =>{
    const {id} = req.params    
    const {city, province_id} = req.body
 
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }
    const existingCity = await City.findOne({ city, province_id });
        if (existingCity) {
            return res.status(400).json({ message: "City already exists in this province" });
        }
     //delete query
     const adminCity = await City.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!adminCity){
        return res.status(404).json({error: 'City not found'})
    }

    res.status(200).json(adminCity)//nadagdag
}
//DELETE skill
const deleteCity = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const city = await City.findOneAndUpdate({_id: id},
        {isDeleted:1}
        )
    
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