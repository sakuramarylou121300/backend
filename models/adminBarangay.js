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
    },
    isDeleted:{
        type: String,
        default: 0
    },

},{timestamps: true})

module.exports = mongoose.model('AdminBarangay',barangaySchema)