const mongoose = require('mongoose')

const Schema = mongoose.Schema 

const skilledBClearance = new Schema({
    bClearancePhoto:{
        type: String,
        required: true,
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