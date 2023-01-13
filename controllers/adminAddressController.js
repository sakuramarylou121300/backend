const mongoose = require('mongoose')
const Province = require('../models/adminAddress').Province
const City = require('../models/adminAddress').City
const Barangay = require('../models/adminAddress').Barangay

//PROVINCE
//CREATE prov
const createProvince = async(req, res)=>{
    const {provinceName, city} = req.body
    
    //check empty fields
    let emptyFields = []
    if(!provinceName){
        emptyFields.push('provinceName')
    }
    //send message if there is an empty fields
    if(emptyFields.length >0){
        return res.status(400).json({error: 'Please fill in all the blank fields.', emptyFields})
    }
    
    try{

        const findProvince = await Province.findOne({provinceName})
        if(findProvince) return res.status(400).json({messg: 'This address already exists.'})
        
        //create query
        const province = await Province.create({
            provinceName,
            city
        })
        res.status(200).json(province)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}

//get prov 
const getAllProvince = async(req, res) =>{

    try{
        const province = await Province.find({}).sort({createdAt: -1})

        res.status(200).json(province)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//GET prov
const getOneProvince = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //find query
    const province = await Province.findById({_id: id})

    //check if not existing
    if (!province){
        return res.status(404).json({error: 'Province not found'})
    }

    res.status(200).json(province)   

}
//UPDATE prov
const updateProvince = async(req, res) =>{
    const {id} = req.params    

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

     //delete query
     const province = await Province.findOneAndUpdate({_id: id},{
         ...req.body //get new value
     })
    
     //check if not existing
     if (!province){
        return res.status(404).json({error: 'Province not found'})
    }

    res.status(200).json(province)
}

//DELETE prov
const deleteProvince = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const province = await Province.findOneAndDelete({_id: id})
    
    //check if not existing
    if (!province){
        return res.status(404).json({error: 'Province not found'})
    }

    res.status(200).json(province)

}

//push city
const pushCity = async(req,res) =>{
    const {id} = req.params 
    try{
        const {city} = req.body

        // const findProvince1 = await Province.findOne({cityName: city.cityName})
        // if(findProvince1) return res.status(400).json({messg: 'This city already exists.'})

        const province = await Province.findOneAndUpdate(
            {_id:id},
    
            {$push:{
                city
            }}
        )
        res.status(200).json(province)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//update or edit city
const editCity = async(req,res) =>{
    const arrayId = req.params.arrayId;
    const {cityName} = req.body
    
    const province = await Province.updateOne({
        "city._id":arrayId
    },
    {
        $set:{
            "city.$.cityName":cityName
        }
    })

    if(province){
        res.send('Successfully updated.')
    }else{
        res.status(500).send('Something is wrong.')
    }
}

//pull city
const pullCity = async(req,res) =>{
    const arrayId = req.params.arrayId;
    
    const province = await Province.updateOne(
    {
        "city._id":arrayId
    },
    {
        $pull:{
            city:{_id:arrayId}
        }
    })

    if(province){
        res.send('Successfully deleted.')
    }else{
        res.status(500).send('Something is wrong.')
    }
}

//push city
const pushBarangay = async(req,res) =>{
    const {id} = req.params 
    try{
        const {barangay} = req.body

        const city = await City.findByIdAndUpdate(
            {_id:id},
    
            {$push:{
                barangay
            }}
        )
        res.status(200).json(city)
    }
    catch(error){
        res.status(400).json({error:error.message})
    }
}

//update or edit city
const editBarangay = async(req,res) =>{
    const arrayId = req.params.arrayId;
    const {barangayName} = req.body
    
    const city = await City.updateOne({
        "barangay._id":arrayId
    },
    {
        $set:{
            "barangay.$.barangayName":barangayName
        }
    })

    if(city){
        res.send('Successfully updated.')
    }else{
        res.status(500).send('Something is wrong.')
    }
}
module.exports = {
    createProvince,
    getAllProvince,
    getOneProvince,
    updateProvince,
    deleteProvince,
    pushCity,
    editCity,
    pullCity,
    pushBarangay,
    editBarangay
}