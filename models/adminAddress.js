const mongoose = require('mongoose')

const Schema = mongoose.Schema

const barangaySchema = new Schema({
    barangayName:{
        type:String,
        required: true
    }
})

const citySchema = new Schema({
    cityName:{
        type:String,
        required: true
    },
    barangay:[barangaySchema]
})


const provinceSchema = new Schema({
    provinceName:{
        type: String,
        required: true
    },
    city:[citySchema]
},{timestamps: true})

const Province = mongoose.model('Province', provinceSchema);
const City = mongoose.model('City', citySchema);
const Barangay = mongoose.model('Barangay', barangaySchema);


module.exports = { Province, City, Barangay };