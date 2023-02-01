const mongoose = require('mongoose')

const Schema = mongoose.Schema

const adminRoleCapabilitySchema = new Schema({
    roleCapability_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleCapability',
        required: true,
    },
    adminInfo_id:{
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'AdminInfo'
    }

},{timestamps: true})

module.exports = mongoose.model('AdminRoleCapability',adminRoleCapabilitySchema)