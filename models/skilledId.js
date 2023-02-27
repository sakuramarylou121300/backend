const mongoose = require('mongoose')

const Schema = mongoose.Schema

const roleSchema = new Schema({
    barangayId:{
        type: Array,
        required: true,
    },
    barangayExp:{
        type: Date,
        required: true
    },
    barangayIsVerified:{
        type: Number,
        default: 0
    }   


},{timestamps: true})

module.exports = mongoose.model('Role',roleSchema)