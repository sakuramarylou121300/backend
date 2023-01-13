const mongoose = require('mongoose')

const Schema = mongoose.Schema

const skilledAddressSchema = new Schema({
    
    houseNo:{
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
    skilled_id:{
        type: String,
        required: true,
        ref: 'SkilledInfo'
    }
},{timestamps: true})
module.exports = mongoose.model('SkilledAddress',skilledAddressSchema)