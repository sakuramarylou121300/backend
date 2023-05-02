const Notification = require('../models/notification')
const mongoose = require('mongoose')


//GET all notification
const getAllNotification = async(req, res)=>{

    try{
        const notification = await Notification.find({isDeleted: 0}).sort({createdAt: -1})
        res.status(200).json(notification)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

module.exports = {
    getAllNotification
}