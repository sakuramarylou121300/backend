const mongoose = require('mongoose')

const Schema = mongoose.Schema

const provinceSchema = new Schema({
   
    province:{
        type: String,
        required: true
    },
    isDeleted:{
        type: Number,
        default: 0
    }
},{timestamps: true})

module.exports = mongoose.model('AdminProvince',provinceSchema)