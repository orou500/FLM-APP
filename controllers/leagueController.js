const League = require('../models/League')

//handle Errors
const handleErrors = (err) => {
    console.log(err.message, err.code)
    let errors = { title: '' }

    //duplicate error code
    if(err.code === 11000){
        errors.title= 'that title is already in use'
        return errors
    }

    //validation errors
    if(err.message.includes('title validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        })
    }
    return errors
}

module.exports.league_get = (req, res) => { 
    res.render('leagues')
}

module.exports.league_post = async (req, res) => {
    const { title } = req.body

    try{
        //create the League in DB
        const league = await League.create({ title })
        res.status(201).json({league: league._id})
    } catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }
}
