const mongoose = require('mongoose')

const Schema = mongoose.Schema

const reasonSchema = new Schema({
    
    reason:{
        type: String,
        required: true
    },
    isDeleted:{
        type: Number,
        default: 0
    }

},{timestamps: true})

module.exports = mongoose.model('Reason',reasonSchema)