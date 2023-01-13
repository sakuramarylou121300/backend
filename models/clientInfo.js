const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const contactSchema = new Schema({
    contactNo:{
        type:String
    }
})

const addressSchema = new Schema({
    houseNo:{
        type:String
    },
    street:{
        type:String
    },
    barangay:{
        type:String
    },
    city:{
        type:String
    },
    province:{
        type:String
    }  
})


const clientInfoSchema = new Schema({
    
    email:{
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
    contact:[contactSchema],
    address:[addressSchema]
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
    email, 
    password, 
    lname, 
    fname, 
    mname,
    contact,
    address
){
    //validation
    if (!email || !password || !lname || !fname || !mname){
        throw Error('All fields must be  filled')
    }
    //check if email is true email
    if (!validator.isEmail(email)){
        throw Error('Please provide a valid email')
    }
    //check if strong password
    if(!validator.isStrongPassword(password)){
        throw Error('Please provide a strong password')
    }

    //check if email is existing
    const exists = await this.findOne({email})
    if (exists){
        throw Error('Email already in use')
    }

    //salt for additional security of the system
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const clientInfo = await this.create({
        email, 
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
clientInfoSchema.statics.login = async function(email, password){
    if (!email || !password){
        throw Error('All fields must be  filled')
    }

    //check if email is existing
    const clientInfo = await this.findOne({email})
    if (!clientInfo){
        throw Error('Incorrect email')
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