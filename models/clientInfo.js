const mongoose = require('mongoose')    
const bcrypt = require('bcrypt')
const validator = require('validator') 

const Schema = mongoose.Schema

const messageSchema = new Schema({
    message:{
        type: String,
        ref: 'ReasonDeact',
        default: ''
    }
})

const clientInfoSchema = new Schema({
    
    username:{
        type: String,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
    },
    lname:{
        type: String,
        required: true,
        trim: true
    },
    fname:{
        type: String,
        required: true,
        trim: true
    },
    mname:{
        type: String,
        trim: true,
        default: ''
    }, 
    contact:{
        type: String,
        required: true,
        trim: true
    },
    houseNo:{
        type:Number,
        required: true,
        trim: true
    },
    street:{
        type:String,
        required: true,
        trim: true
    },
    barangayAddr:{
        type:String,
        required: true
    },
    cityAddr:{
        type:String,
        required: true
    },
    provinceAddr:{
        type:String,
        required: true
    },
    regionAddr:{
        type:String,
        required: true
    },
    addIsVerified:{
        type: Number,
        default: 0
    },
    message:[messageSchema],
    otp:{
        type: String,
        default: ''
    },
    idIsVerified:{
        type: Number,
        default: 0
    },
    userIsVerified:{
        type: Number,
        default: 0
    },
    isDeleted:{
        type: Number,
        default: 0
    },
    //to follow
    clientDeact:{
        type: Number,
        default: 0
    },
 
},{
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true },
    timestamps: true// So `console.log()` and other functions that use `toObject()` include virtuals
},
{timestamps: true})

clientInfoSchema.virtual('clientBarangay', {
    ref: 'ClientBClearance',
    localField: '_id',
    foreignField: 'client_id'
});
clientInfoSchema.virtual('clientNbi', {
    ref: 'ClientNClearance',
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
    houseNo,
    street,
    barangayAddr,
    cityAddr,
    provinceAddr,
    regionAddr
){
    // await userExists(username);
    //validation
    if (!username || !password || !lname || !fname || !contact || !street || !barangayAddr 
        || !cityAddr || !provinceAddr || !regionAddr){
        throw Error('Please fill in all the blank fields.')
    }

    //check  length
    if(username.length <7){
        throw Error('Please enter atleast 6 characters in user name.')
    }
    //check if strong password
    if(password.length <7){
        throw Error('Please enter atleast 6 characters in password.')
    }
    const mobileNumberRegex = /^09\d{9}$|^639\d{9}$/;
        
    if (!mobileNumberRegex.test(contact)) {
        throw new Error('Please check your contact number.');
    }

    //check if  is existing admin, client and skilled
    const adminExists = await AdminInfo.findOne({username})
    if (adminExists){
        throw Error('Username already in use.')
    }
    const skilledExists = await SkilledInfo.findOne({username})
    if (skilledExists){
        throw Error('Username already in use.')
    }
    const exists = await this.findOne({username})
    if (exists){
        throw Error('Username already in use.')
    }

    const clientInfoWithSameDetails = await this.findOne({
        fname: fname,
        mname: mname,
        lname: lname,
        contact: contact,
        houseNo: houseNo,
        street: street,
        barangayAddr: barangayAddr,
        cityAddr: cityAddr,
        provinceAddr: provinceAddr,
        regionAddr: regionAddr,
        isDeleted:{$in: [0, 1]}
    });

    if (clientInfoWithSameDetails) {
    throw Error("User already exist.");
    }

    //salt for additional security of the system
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const clientInfo = await this.create({
        username, 
        password: hash,// defining the value to password password with hash 
        lname,
        fname,
        mname,
        contact,
        houseNo,
        street,
        barangayAddr,
        cityAddr,
        provinceAddr,
        regionAddr
    })
    return clientInfo
}

//static login method
clientInfoSchema.statics.login = async function(username, password){

    if (!username || !password){
        throw Error('Please fill in all the blank fields.')
    }

    //check if  is existing
    const clientInfo = await this.findOne({username})
    if (!clientInfo){
        throw Error('Incorrect username.')
    }

    //if deleted then show reason
    if (clientInfo.isDeleted === 1) {
        const messageIds = clientInfo.message.map(msg => msg.message);
        
        const messages = await Promise.all(messageIds.map(async (msgId) => {
            const msg = await ReasonDeact.findOne({ _id: msgId });
            return msg.reason;
        }));
  
        throw Error(`Your account has been deleted because of ${messages.join(', ')}.`);
        
    }

    //check if the password and password hash in match
    const match = await bcrypt.compare(password, clientInfo.password)
    //if not match
    if(!match){
        throw Error('Incorrect password.')
    }

    return clientInfo
}

module.exports = mongoose.model('ClientInfo', clientInfoSchema)
const AdminInfo = require('../models/adminInfo') 
const SkilledInfo = require('../models/skilledInfo') 
const ReasonDeact = require('../models/reasonDeact') 

