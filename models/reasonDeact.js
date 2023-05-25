const mongoose = require('mongoose')

const Schema = mongoose.Schema

const reasonDeactSchema = new Schema({
    
    reason:{
        type: String,
        default: ''
    },
    isDeleted:{
        type: Number,
        default: 0
    }

},{timestamps: true})

module.exports = mongoose.model('ReasonDeact',reasonDeactSchema)