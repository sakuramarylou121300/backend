const mongoose = require('mongoose')

const Schema = mongoose.Schema  

const skilledBClearance = new Schema({
    photo:{
        type: String,
        required: true,
    },
    cloudinary_id:{
        type: String
    },
    bClearanceExp:{
        type: Date,
        required: true,
    },
    bClearanceIsVerified:{
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

module.exports = mongoose.model('SkilledBClearance',skilledBClearance)