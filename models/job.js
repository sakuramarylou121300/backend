const mongoose = require('mongoose')

const Schema = mongoose.Schema

const jobSchema = new Schema({

    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    barangay: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    prov: {
        type: String,
        required: true
    },
    start:{
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    client_id: {
        type: String,
        required: true,
    },

},{timestamps: true})

module.exports = mongoose.model('Job',jobSchema)