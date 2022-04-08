const jwt = require('jsonwebtoken')
const User = require('../models/User')

const checkAuth = (req, res, next) => {
    const token = req.cookies.jwt
    
    try{
        jwt.verify(token, process.env.JWT_KEY)
        next()
    } catch(error) { 
        res.status(401).redirect('/login')
    }
}

const checkUser = (req, res, next) => {
   const token = req.cookies.jwt;
   if(token) {
       jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
           if(err) {
               console.log(err.message)
               res.locals.user = null
               next()
           } else {
               console.log(decodedToken)
               let user = await User.findById(decodedToken.id)
               res.locals.user = user
               next()
           }
       })
   }
   else{
       res.locals.user = null
       next()
   }
}

const checkIfAdmin = async (req, res, next) => {
    if(res.locals.user.admin){
        next()
    }else{
        res.redirect('/')
        next()
    }
}


module.exports = { checkAuth, checkUser, checkIfAdmin };