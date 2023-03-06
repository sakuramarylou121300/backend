const mongoose = require('mongoose') 

const Schema = mongoose.Schema 

const skilledBarangay = new Schema({
    barangayPhoto:{
        type: String,
        required: true,
    },
    barangayExp:{
        type: Date,
        required: true,
    },
    cloudinary_id:{
        type: String,
        required: true,
    },
    barangayIsVerified:{
        type: Number,
        default: 0,
    },
    skilled_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SkilledInfo'
    },
    isDeleted:{
        type: Number,
        default: 0,
    },
},{timestamps: true})

module.exports = mongoose.model('SkilledBarangay',skilledBarangay)