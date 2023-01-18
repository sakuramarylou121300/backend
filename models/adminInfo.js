const mongoose = require('mongoose') 
const bcrypt = require('bcrypt') 
const validator = require('validator')

const Schema = mongoose.Schema

const adminInfoSchema = new Schema({
    
    username:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    lname:{
        type: String,
        required: true
    },
    fname:{
        type: String,
        required: true
    },
    mname:{
        type: String
    }, 
    contact:{
        type:String,
        required: true
    },
    isMainAdmin:{
        type:Number,
        default: 0
    },
},{
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
},
{timestamps: true})

adminInfoSchema.virtual('roleCapabality', {
    ref: 'RoleCapability',
    localField: '_id',
    foreignField: 'adminInfo_id'
});

//when using this, suggest to use regular function
adminInfoSchema.statics.signup = async function (
    username, 
    password,
    lname,
    fname,
    mname,
    contact,
    roleCapability
){
    
    if (!username || !password || !lname || !fname || !contact){
        throw Error('Please fill in all the blank fields.')
    }

    //check  length
    if(username.length <6){
        throw Error('Please enter atleast 8 characters in user name.')
    }
    //check if strong password
    if(password.length <6){
        throw Error('Please enter atleast 8 characters in password.')
    }

    //   //check if  is existing
      const skilledExists = await SkilledInfo.findOne({username})
      if (skilledExists){
          throw Error('Email already in use. Please enter a new unique .')
      }

    //check if  is existing
    const exists = await this.findOne({username})
    if (exists){
        throw Error('Email already in use. Please enter a new unique .')
    }

    //salt for additional security of the system
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const adminInfo = await this.create({
        username, 
        password: hash,// defining the value to password password with hash 
        lname,
        fname,
        mname,
        contact,
        roleCapability
    })
    return adminInfo
}

//static login method
adminInfoSchema.statics.login = async function(username, password){

    if (!username || !password){
        throw Error('Please fill in all the blank fields.')
    }

    //check if  is existing
    const adminInfo = await this.findOne({username})
    if (!adminInfo){
        throw Error('Incorrect username.')
    }
    //check if the password and password hash in match
    const match = await bcrypt.compare(password, adminInfo.password)
    //if not match
    if(!match){
        throw Error('Incorrect password.')
    }

    return adminInfo
}

module.exports = mongoose.model('AdminInfo', adminInfoSchema)
const SkilledInfo = require('../models/skilledInfo') 
