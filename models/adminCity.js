const mongoose = require('mongoose')

const Schema = mongoose.Schema

const citySchema = new Schema({
   
    city:{
        type: String,
        required: true
    },
    province_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AdminProvince'
    },
    isDeleted:{
        type: Number,
        default: 0
    },

},{timestamps: true})

module.exports = mongoose.model('AdminCity',citySchema)