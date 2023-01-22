const mongoose = require('mongoose') 
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

// const contactSchema = new Schema({
//     contactNo:{
//         type:String
//     }
// })

// const addressSchema = new Schema({
//     houseNo:{
//         type:String
//     },
//     street:{
//         type:String
//     },
//     barangay:{
//         type:String
//     },
//     city:{
//         type:String
//     },
//     province:{
//         type:String
//     }  
// })


const clientInfoSchema = new Schema({
    
    username:{
        type: String,
        unique: true
    },
    password:{
        type: String
    },
    lname:{
        type: String
    },
    fname:{
        type: String
    },
    mname:{
        type: String
    },
    // contact:[contactSchema],
    // address:[addressSchema]
},{
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
},
{timestamps: true})

clientInfoSchema.virtual('contacts', {
    ref: 'ClientContact',
    localField: '_id',
    foreignField: 'client_id'
});
clientInfoSchema.virtual('location', {
    ref: 'ClientAddress',
    localField: '_id',
    foreignField: 'client_id'
});

//static sign up method
//when using this, suggest to use regular function
clientInfoSchema.statics.signup = async function (
    username, 
    password, 
    lname, 
    fname, 
    mname,
    contact,
    address
){
    //validation
    if (!username || !password || !lname || !fname || !mname){
        throw Error('All fields must be  filled')
    }
    //check if username is true username
    // if (!validator.isusername(username)){
    //     throw Error('Please provide a valid username')
    // }
    // //check if strong password
    // if(!validator.isStrongPassword(password)){
    //     throw Error('Please provide a strong password')
    // }

    if(username.length <8){
        throw Error('Please enter atleast 8 characters in user name.')
    }
    //check if strong password
    if(password.length <8){
        throw Error('Please enter atleast 8 characters in password.')
    }
    //check if  is existing admin, skilled and client
    const adminExists = await AdminInfo.findOne({username})
    if (adminExists){
        throw Error('Email already in use. Please enter a new unique .')
    }
    const skilledExists = await SkilledInfo.findOne({username})
    if (skilledExists){
        throw Error('Email already in use. Please enter a new unique .')
    }
    const exists = await this.findOne({username})
    if (exists){
        throw Error('username already in use')
    }

    //salt for additional security of the system
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const clientInfo = await this.create({
        username, 
        password: hash, // defining the value to password password with hash
        lname, 
        fname,
        mname,
        contact,
        address
    })

    return clientInfo
}

//static login method
clientInfoSchema.statics.login = async function(username, password){
    if (!username || !password){
        throw Error('All fields must be  filled')
    }

    //check if username is existing
    const clientInfo = await this.findOne({username})
    if (!clientInfo){
        throw Error('Incorrect username')
    }
    //check if the password and password hash in match
    const match = await bcrypt.compare(password, clientInfo.password)
    //if not match
    if(!match){
        throw Error('Incorrect password')
    }

    return clientInfo
}

module.exports = mongoose.model('ClientInfo',clientInfoSchema)
const AdminInfo = require('../models/adminInfo') 
const SkilledInfo = require('../models/skilledInfo') 