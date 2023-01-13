const mongoose = require('mongoose')

const Schema = mongoose.Schema

const clientAddressSchema = new Schema({
    
    houseNo:{
        type: String
    },
    building:{
        type: String
    },
    street:{
        type: String
    },
    barangay:{
        type: String
    },
    city:{
        type: String
    },
    prov:{
        type: String
    },
    client_id:{
        type: String,
        required: true,
        ref: 'ClientInfo'
    }
},{timestamps: true})
module.exports = mongoose.model('ClientAddress',clientAddressSchema)