const mongoose = require('mongoose')

const Schema = mongoose.Schema

const barangaySchema = new Schema({
   
    barangay:{
        type: String,
        required: true
    },
    city_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AdminCity'
    }

},{timestamps: true})

module.exports = mongoose.model('AdminBarangay',barangaySchema)