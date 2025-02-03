import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userName : {
    type : String,
    required : true,
    unique : [true, "username is already taken"],
    lowercase : true,
    minlength : [3, "username must be at least 3 characters long"],
    maxlength : 20,
    trim : true,
  },
  email : {
    type : String,
    required : true,
    unique : [true, "email is already taken"],
    // match : [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    trim : true,
  },
  password : {
    type : String,
    required : true,
    minlength : [8, "password must be at least 8 characters long"],
    maxlength : 100,
    trim : true,
    // select : false,
  },
  phone : {
    type : String,
    required : true,
    unique : [true, "phone number is already registered"],
    // match : [/^\+?([0-9]{1,3})\s?[-. (]*([0-9]{1,3})[-. )]*([0-9]{1,4})[-. ]*([0-9]{1,4})$/, "Please enter a valid phone number"],
    trim : true,
  },
  profileImage : String,
  isDeleted : {
    type : Boolean,
    default : false,
  },
  isEmailVerified : {
    type : Boolean,
    default : false,  
  }
}, {timestamps : true});

export const User = mongoose.models.User || mongoose.model('User', userSchema);