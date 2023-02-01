const mongoose = require('mongoose')

const Schema = mongoose.Schema

const capabilitySchema = new Schema({
    capabilityName:{
        type: String,
        required: true,
    },
    isDeleted:{
        type: Number,
        default: 0,
    }

},{timestamps: true})

module.exports = mongoose.model('Capability',capabilitySchema)