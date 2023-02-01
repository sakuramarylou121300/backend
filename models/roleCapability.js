const mongoose = require('mongoose')

const Schema = mongoose.Schema

const roleCapabilitySchema = new Schema({

    role_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Role'
    },
    capability_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Capability'
    },
    adminInfo_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AdminInfo'
    },
    isDeleted:{
        type: Number,
        default: 0
    },

},{timestamps: true})

module.exports = mongoose.model('RoleCapability',roleCapabilitySchema)