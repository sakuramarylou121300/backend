const mongoose = require('mongoose')

const Schema = mongoose.Schema 

const skilledNClearance = new Schema({
    photo:{
        type: String,
        required: true,
    },
    cloudinary_id:{
        type: String
    },
    nClearanceExp:{
        type: Date,
        required: true,
    },
    nClearanceIsVerified:{
        type: Number,
        default: 0,
    },
    isDeleted:{
        type: Number,
        default: 0,
    },
    skilled_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SkilledInfo'
    },
},{timestamps: true})

module.exports = mongoose.model('SkilledNClearance',skilledNClearance)