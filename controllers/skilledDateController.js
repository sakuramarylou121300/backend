const SkilledDate = require('../models/skilledDate')
const moment = require('moment-timezone');
const mongoose = require('mongoose')

//CREATE skilled dates
const createSkilledDates = async (req, res) => {
    try {
        const skilled_id = req.skilledInfo._id;
        const skilledDatesToAdd = req.body;

        // Check for empty skilledDates or duplicate skilledDates
        const existingSkilledDates = await SkilledDate.find({ skilled_id });
        const existingDates = existingSkilledDates.map(date => moment(date.skilledDate).format('MM-DD-YYYY'));
        const newSkilledDates = [];

        if (!skilledDatesToAdd || skilledDatesToAdd.length === 0) {
            res.status(400).json({ error: "Please enter date." });
            return;
        }

        for (const skilledDate of skilledDatesToAdd) {
            // Check for empty skilledDate
            if (!skilledDate || skilledDate.skilledDate === "") {
                res.status(400).json({ error: "Please enter date." });
                return;
            }

            // Convert skilledDate string to a Date object
            const dateFormat = 'MM-DD-YYYY';
            const timeZone = 'America/New_York'
            const validUntilDate = moment.tz(skilledDate.skilledDate, dateFormat, timeZone).utc();

            if (!validUntilDate.isValid()) {
                res.status(400).json({ error: "Please enter a valid date in the format MM-DD-YYYY." });
                return;
            }

            if (validUntilDate.isBefore(moment().utc().startOf('day'), 'day')) {
                res.status(400).json({ error: "Please enter today's date or a date in the future." });
                return;
            }

            const formattedDate = validUntilDate.format('MM-DD-YYYY');
            if (existingDates.includes(formattedDate)) {
                res.status(400).json({ error: "Please remove repeating date." });
                return;
            }

            existingDates.push(formattedDate);
            newSkilledDates.push({ skilledDate: validUntilDate.toDate(), skilled_id });
        }

        const skilledDates = await SkilledDate.insertMany(newSkilledDates);
        res.status(201).json({ message: 'Successfully added.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

//CREATE skilled date
const createSkilledDate = async (req, res) => {
    const { skilledDate } = req.body;
    const skilled_id = req.skilledInfo._id;
    // If empty
    if (skilledDate === "") {
        res.status(404).json({ error: "Please enter a date." });
        return;
    }

    //check if the date in the req.body is less than date today
    const dateMoment = moment.utc(skilledDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
    const validUntilDate = dateMoment.toDate();

    if (validUntilDate < new Date()) {
        return res.status(400).json({ error: 'Please enter date today or date in the future.' });
    }

    try {
        const checkSkilledDate = await SkilledDate.findOne({
        skilledDate: skilledDate,
        skilled_id,
        isDeleted: 0
        });

        if (checkSkilledDate) {
            res.status(400).json({ error: "Date is already marked as unavailable." });
            return;
        }
        // Create query
        const skilledDateCreate = await SkilledDate.create({
            skilledDate: skilledDate,
            skilled_id
        });

        res.status(200).json({ message: "Successfully added." });
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

//GET ALL skilled date
const getAllSkilledDate = async(req, res)=>{

    try{
        const skilled_id = req.skilledInfo._id;
        //get all query
        const skilledDateGet = await SkilledDate.find({skilled_id, isDeleted: 0})
        .sort({skilledDate: 1})
        .populate('skilled_id', 'username lname fname mname')
        .populate('client_id', 'username lname fname mname')

        const formattedSkilledBClearance = skilledDateGet.map((clearance) => ({
            ...clearance.toObject(),
            skilledDate: moment(clearance.skilledDate).tz('Asia/Manila').format('MM-DD-YYYY')
        }));
        res.status(200).json(formattedSkilledBClearance)
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
    const skilledDateGetOne = await SkilledDate.findById({_id: id})

    //check if not existing
    if (!skilledDateGetOne){
        return res.status(404).json({error: 'Date not found.'})
    }
    const formattedSkilledBClearance = {
        ...skilledDateGetOne.toObject(),
        skilledDate: moment(skilledDateGetOne.skilledDate).tz('Asia/Manila').format('MM-DD-YYYY')
    };

    res.status(200).json(formattedSkilledBClearance)   
}

//UPDATE skilled date
const updateSkilledDate = async(req, res) =>{
    const {id} = req.params    
    const {skilledDate} = req.body
    const skilled_id = req.skilledInfo._id;

    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    // If empty
    if (skilledDate === "") {
        res.status(404).json({ error: "Please enter a date." });
    }

    //check if the date in the req.body is less than date today
    const dateMoment = moment.utc(skilledDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
    const validUntilDate = dateMoment.toDate();

    if (validUntilDate < new Date()) {
        return res.status(400).json({ error: 'Please enter date today or date in the future.' });
    }

    //if existing
    const checkSkilledDate = await SkilledDate.findOne({
        skilledDate: skilledDate,
        skilled_id,
        isDeleted: 0
    });

    if (checkSkilledDate) {
        return res.status(400).json({ error: "Date is already marked as unavailable." });
    }

    //update
    const skilledDateUpdate = await SkilledDate.findOneAndUpdate({_id: id},{
        skilledDate: skilledDate
    })

    res.status(200).json({message: "Successfully updated."})
}

const deleteSkilledDate = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id.'})
    }

    // Find the skilled date
    const skilledDate = await SkilledDate.findOne({ _id: id });

    // Check if the skilled date exists
    if (!skilledDate) {
        return res.status(404).json({ error: 'Date not found.' });
    }

    // Check if the skilled date has a client_id
    if (skilledDate.client_id) {
        return res.status(403).json({ error: 'The date you are trying to delete is set or reserved by your client.' });
    }

    //delete query
    const skilledDateUpdate = await SkilledDate.findOneAndUpdate({_id: id},
        {isDeleted:1})

    
    res.status(200).json({message: "Successfully deleted."})

}
module.exports = {
    createSkilledDates,
    createSkilledDate,
    getAllSkilledDate,
    getOneSkilledDate,
    updateSkilledDate,
    deleteSkilledDate
}