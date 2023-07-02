const SkilledDate = require('../models/skilledDate')
const moment = require('moment-timezone');
const mongoose = require('mongoose')

//CREATE skilled date
const createSkilledDate = async (req, res) => {
    const { skilledDate } = req.body;

    // If empty
    if (skilledDate === "") {
        res.status(404).json({ error: "Please enter a date." });
    }

    // Convert the skilledDate string to a Date object
    const dateFormat = 'MM-DD-YYYY';
    const timeZone = 'YourTimeZone'; // Replace 'YourTimeZone' with the desired timezone e.g., 'UTC', 'America/New_York', etc.

    const validUntilDate = moment.tz(skilledDate, dateFormat, timeZone).utc();
    const today = moment().utc().startOf('day');

    // Check if the validUntil date is less than today's date
    if (validUntilDate.isBefore(today, 'day')) {
        return res.status(400).json({ error: 'The provided date corresponds to yesterday. Please enter today\'s date or a date in the future.' });
    }

    try {
        const checkSkilledDate = await SkilledDate.findOne({
            skilledDate: validUntilDate.toDate(),
            isDeleted: 0
        });

        if (checkSkilledDate) {
            return res.status(400).json({ error: "Date is already marked as unavailable." });
        }
        
        // Create query
        const skilled_id = req.skilledInfo._id;
        const skilledDateCreate = await SkilledDate.create({
            skilledDate: validUntilDate.toDate(),
            skilled_id
        });
        
        res.status(200).json({ message: "Successfully added." });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

//GET ALL skilled date
const getAllSkilledDate = async(req, res)=>{

    try{
        //get all query
        const skilledDateGet = await SkilledDate.find({isDeleted: 0})
        .sort({skilledDate: 1})
        res.status(200).json(skilledDateGet)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

//GET ONE skilled date
const getOneSkilledDate = async(req, res)=>{
    const {id} = req.params  

     //check if id is not existing
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    //find query
    const skilledDate = await SkilledDate.findById({_id: id})

    //check if not existing
    if (!skilledDate){
        return res.status(404).json({error: 'Date not found.'})
    }

    res.status(200).json(skilledDate)   
}

//UPDATE skilled date
const updateSkilledDate = async(req, res) =>{
    const {id} = req.params    
    const {skilledDate} = req.body

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    // If empty
    if (skilledDate === "") {
        res.status(404).json({ error: "Please enter a date." });
    }

    // Convert the skilledDate string to a Date object
    const dateFormat = 'MM-DD-YYYY';
    const timeZone = 'YourTimeZone'; // Replace 'YourTimeZone' with the desired timezone e.g., 'UTC', 'America/New_York', etc.

    const validUntilDate = moment.tz(skilledDate, dateFormat, timeZone).utc();
    const today = moment().utc().startOf('day');

    // Check if the validUntil date is less than today's date
    if (validUntilDate.isBefore(today, 'day')) {
        return res.status(400).json({ error: 'The provided date corresponds to yesterday. Please enter today\'s date or a date in the future.' });
    }

    //if existing
    const checkSkilledDate = await SkilledDate.findOne({
        skilledDate: validUntilDate.toDate(),
        isDeleted: 0
    });

    //update
    const skilledDateUpdate = await SkilledDate.findOneAndUpdate({_id: id},{
        ...req.body //get new value
    })

    res.status(200).json({message: "Successfully updated."})
}
module.exports = {
    createSkilledDate,
    getAllSkilledDate,
    getOneSkilledDate,
    updateSkilledDate
}