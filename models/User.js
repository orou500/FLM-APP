const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'email must be valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter an Password'],
        minlength: [6, 'Password must be at least 6 charcters'],
    },
    firstName: {
        type: String,
        required: [true, 'Please enter your first name'],
        minlength: [2, 'First name must be at least 2 charcters'],
    },
    lastName: {
        type: String,
        required: [true, 'Please enter your last name'],
        minlength: [2, 'last name must be at least 2 charcters'],
    }
})

//fire a fumction before doc saved to db
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

//static method to login user
/*userSchema.statics.login = async function(email, password){
    const user = await this.findeOne({ email })
    if(user){
      const auth = await bcrypt.compare(password, user.password)
      if(auth){
          return user
      }
      throw Error('incorrect password')
    }
    throw Error('incorrect email')
}*/

const User = mongoose.model('user', userSchema)
module.exports = User