const mongoose = require('mongoose')

const Schema = mongoose.Schema

const skilledContactSchema = new Schema({
    
    contactType:{
        type: String,
        required: true
    },
    contactNo:{
        type: Number,
        required: true
    },
    emailAcc:{
        type: String,
        default: 'None'
    },
    skilled_id:{
        type: String,
        required: true,
        ref: 'SkilledInfo'
    },
   
},{timestamps: true})

module.exports = mongoose.model('SkilledContact',skilledContactSchema)