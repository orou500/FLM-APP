const League = require('../models/League')
const User =require('../models/User')

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
    const { title, slug, usersId } = req.body

    try{
        //create the League in DB
        const league = await League.create({ title, slug, usersId })
        User.findOneAndUpdate({"_id": usersId}, { $push: { "leaguesId": league._id } }, function(err){
            if(err){
                res.status(500).render('404')
            }
            res.status(201).json({league: league._id})
        })
    } catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }
}


module.exports.league_delete = async (req, res) => {
    League.findByIdAndDelete(req.params.id).then(() => {
        User.updateMany(
            { },
            { $pull : {leaguesId: req.params.id} },
            function(err, data) { 
                if(err){
                    res.status(500).render('404')
                }
                res.status(200).redirect('../leagues')
             })
        }).catch(error => {
            res.status(500).render('404')
    })
}

module.exports.oneleague_get = (req, res) => { 
    League.findOne({ slug: req.params.slug }).then((leagues) => {
        res.status(200).render('league', {leagues: leagues})
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

module.exports.addUserToLeague = (req, res) => { 
    const { email } = req.body
    User.find({ email }).then((users) => {
        if(users.length === 0){
            return res.status(401).render('404')
        }
        const [ user ] = users;

        League.findByIdAndUpdate(req.params.id,{$push: {"usersId": user}},{new:true},function(err){
            if(err){
                res.status(500).render('404')
            }
            User.findOneAndUpdate({"email": user.email}, { $push: { "leaguesId": req.params.id } }, function(err){
                if(err){
                    res.status(500).render('404')
                }
                res.status(200).redirect('../../leagues')
            })
        })
    })
}