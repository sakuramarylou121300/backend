const mongoose = require('mongoose')

const Schema = mongoose.Schema

const clientContactSchema = new Schema({
    
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
    },
    client_id:{
        type: String,
        required: true,
        ref: 'ClientInfo'
    },
   
},{timestamps: true})

module.exports = mongoose.model('ClientContact',clientContactSchema)