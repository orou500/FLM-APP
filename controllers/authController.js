const User = require('../models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

//handle Errors
const handleErrors = (err) => {
    console.log(err.message, err.code)
    let errors = { email: '', password: ''}

    //duplicate error code
    if(err.code === 11000){
        errors.email= 'that email is already in use'
        return errors
    }

    //validation errors
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        })
    }
    return errors
}

const maxAge = 3 * 24 * 60 * 60
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_KEY, {
        expiresIn: maxAge,
    })
}

module.exports.register_get = (req, res) => { 
    res.render('register')
}

module.exports.login_get = (req, res) => {
    res.render('login')
}


module.exports.register_post = async (req, res) => {
    const { email, password, firstName, lastName, admin } = req.body
    try{
        //create the user in DB
        const user = await User.create({ email, password, firstName, lastName, admin })
        const token = createToken(user._id)
        //res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})

        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'flmappmail@gmail.com',
                pass: '388993164Or*'
            }
        });
        let mailDetails = {
            from: 'flmappmail@gmail.com',
            to: `${user.email}`,
            subject: `Hi ${user.firstName}, Please verify your user.`,
            text: `
            Hi ${user.firstName}, Please verify your user.
            link: http://${req.headers.host}/user/verify/${user.id}/
            `
        };

        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log('Error Occurs');
            } else {
                console.log('Email sent successfully');
                res.status(201).json({user: user._id})
            }
        });

        res.status(201).json({user: user._id})
    } catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }
}

module.exports.login_post = (req, res) => {
    const { email, password } = req.body

    User.find({ email }).then((users) => {
        if(users.length === 0){
            return res.status(401).render('login');
        }
        const [ user ] = users;

        bcrypt.compare(password, user.password, (error, result) => {
            if(error){
                return res.status(401).render('login');
            }
            if(!user.verify){
                return res.status(401).render('login');
            }

            if(result) {
                const token = createToken(user._id)
                res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
                res.status(201).json({user: user._id})
            }

            res.status(401).render('login');

        })
    })
}

module.exports.logout_get = (req, res) => { 
    res.cookie('jwt', '', {maxAge: 1})
    res.redirect('/')
}

module.exports.updateUser = (req, res) => { 
    User.findByIdAndUpdate(req.params.id,{$set:req.body}, function(err){
        if(err){
            res.status(500).render('404')
        }
        res.status(200).redirect('../../')
    })
}