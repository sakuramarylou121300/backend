const Notification = require('../models/adminNotification')
const mongoose = require('mongoose')


//GET all notification
const getAllNotification = async(req, res)=>{

    try{
        const notification = await Notification
        .find({isDeleted: 0})
        .sort({createdAt: -1})
        .populate('skilled_id')
        .populate('client_id')
        // .count({isRead:0})
        // const count = notification.filter(notification => notification.isRead === 0).length;
        const unreadCount = notification.filter(notification => notification.isRead === 0).length;
        const output = {
            notification,
            unreadCount
        }
        
        await Notification.updateMany({
            isRead:0 }, 
            {$set: { isRead: 1 } });

        res.status(200).json(output)
    }
    catch(error){
        res.status(404).json({error: error.message})
    }  
}

const deleteNotification = async(req, res)=>{
    const {id} = req.params
    
    //check if id is not existing
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'Invalid id'})
    }

    //delete query
    const notification = await Notification.findOneAndUpdate({_id: id},
        {isDeleted:1})
    
    //check if not existing
    if (!notification){
        return res.status(404).json({error: 'Notification not found'})
    }

    res.status(200).json(notification)

}

module.exports = {
    getAllNotification,
    deleteNotification 
}