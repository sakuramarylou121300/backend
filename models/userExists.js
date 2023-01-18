const mongoose = require('mongoose')
const AdminInfo = require('../models/adminInfo'); 
const SkilledInfo = require('../models/skilledInfo')

async function userExists(username) {
    const adminExists = await AdminInfo.findOne({username});
    if (adminExists) {
        throw Error('Email already in use. Please enter a new unique.');
    }
    const skilledExists = await SkilledInfo.findOne({username});
    if (skilledExists) {
        throw Error('Email already in use. Please enter a new unique.');
    }
}

module.exports = userExists; 
