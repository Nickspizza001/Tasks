const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    id: {
        type: String,
        
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true
    }, 
    registrationUrl:{
        type: String,
        required: true
    }, 
    image:{
        data: Buffer,
        contentType: String
    }
   
 
}, {timestamps: true});



const User = mongoose.model('Users', userSchema);

module.exports =  User;