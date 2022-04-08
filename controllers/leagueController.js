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

module.exports.leagues_get = (req, res) => { 
    League.find().then((leagues) => {
        res.status(200).render('leagues', {leagues: leagues})
    }).catch(error => {
        res.status(500).render('404')
    })
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


module.exports.league_delete = async (req, res) => {
    League.findByIdAndDelete(req.params.id).then(() => {
        res.status(200).redirect('../leagues')
        }).catch(error => {
            res.status(500).render('404')
    })
}

module.exports.oneleague_get = (req, res) => { 
    League.findOne({ id: req.params._id }).then((leagues) => {
        res.status(200).render(`league`, {leagues: leagues})
    }).catch(error => {
        res.status(500).render('404')
    })
}

module.exports.updateLeague = (req, res) => { 
    League.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true}, function(err){
        if(err){
            res.status(500).render('404')
        }
        res.status(200).redirect('../../leagues')
    })
}