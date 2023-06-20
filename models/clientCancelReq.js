const mongoose = require('mongoose')

const Schema = mongoose.Schema

const clientCancelReqSchema = new Schema({
    
    reason:{
        type: String,
        default: ''
    },
    isDeleted:{
        type: Number,
        default: 0
    }

},{timestamps: true})

module.exports = mongoose.model('ClientCancelReq',clientCancelReqSchema)