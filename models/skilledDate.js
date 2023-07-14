const mongoose = require('mongoose')    

const Schema = mongoose.Schema

const skilledDateSchema = new Schema({

    skilledDate:{
        type: Date
    },
    skilled_id:{
        type: String,
        ref: 'SkilledInfo'
    },
    client_id:{
        type: String,
        ref: 'ClientInfo'
    },
    isDeleted:{
        type: Number,
        default: 0,
    },
},{timestamps: true})

module.exports = mongoose.model('SkilledDate',skilledDateSchema)
