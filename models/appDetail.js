const mongoose = require('mongoose')

const Schema = mongoose.Schema

const appDetailSchema = new Schema({
    appRule:{
        type: String,
        required: true
    },
    contact:{
        type: String,
        required: true
    },
    isDeleted:{
        type: Number,
        default: 0,
    }

},{timestamps: true})

module.exports = mongoose.model('AppDetail',appDetailSchema)