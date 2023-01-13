const mongoose = require('mongoose')

const Schema = mongoose.Schema

const barangaySchema = new Schema({
   
    barangay:{
        type: String,
        required: true,
        unique: true
    },
    city_id:{
        type: String, 
        ref: 'AdminCity'
    }

},{timestamps: true})

module.exports = mongoose.model('AdminBarangay',barangaySchema)