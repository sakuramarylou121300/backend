const mongoose = require('mongoose') 

const Schema = mongoose.Schema

const billSchema = new Schema({
    billPhoto:{
        type: String
    },
    billIssuedOn:{
        type: Date,
        required: true
    },
    billDueDate:{
        type: Date,
        default: Date.now
    },
    billIsVerified:{
        type: Number,
        default: 0
    },
    billMessage:{
        type: String,
        default:''
    },
    skilled_id:{
        type: String,
        required: true,
        ref: 'SkilledInfo'
    },

},{timestamps: true})

module.exports = mongoose.model('SkilledBill',billSchema)