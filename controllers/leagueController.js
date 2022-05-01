const League = require('../models/League')
const User =require('../models/User')
const Match =require('../models/Match')

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
   
    League.findByIdAndDelete(req.params.id).then((league) => {
        Match.deleteMany({leagueId: req.params.id}, function (err) {
            res.status(200).redirect('../leagues')
        }).catch(error => {
            User.updateMany(
                { },
                { $pull : {leaguesId: req.params.id, matchesId: {$in: league.matchesId }, firstPlaces: {$in: league.matchesId }, secondPlaces: {$in: league.matchesId }, KOG: {$in: league.matchesId }, KOA: {$in: league.matchesId }},
                function(err, data) { 
                    if(err){
                        res.status(500).render('404')
                    }
                    res.status(500).render('404')
                 }
            }).catch(error => {
                res.status(500).render('404')
        })
        })
})}

module.exports.oneleague_get = (req, res) => { 
    League.findOne({ slug: req.params.slug }).then((leagues) => {
        Match.find({leagueId: leagues.id}).then((matches) => {
            User.find({leaguesId: leagues.id}).then((usersInLeague) =>{
                res.status(200).render('league', {leagues: leagues, matches: matches, usersInLeague: usersInLeague})
            }).catch(error => {
                res.status(500).render('404')
            })
        }).catch(error => {
            res.status(500).render('404')
        })
    }).catch(error => {
        res.status(500).render('404')
    })
}

module.exports.updateLeague = (req, res) => { 
    League.findByIdAndUpdate(req.params.id,{$set:req.body}, function(err){
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
        //find the user, if the user already have thet leagueId then send error else add the leagueId to the user and the UserId to the League

        User.findOneAndUpdate({"email": user.email}, { $addToSet: { leaguesId: req.params.id } }, function(err){
            if(err){
                res.status(500).render('404')
            }
        })
        League.findByIdAndUpdate(req.params.id,{$addToSet: {usersId: user}},function(err, league){
            if(err){
                res.status(500).render('404')
            }
        })
        res.status(200).redirect('../../leagues')
    })
}

module.exports.findLeaguesUser = (req, res) => {
    let usersLeague = []

    for(let i = 0; i < res.locals.user.leaguesId.length; i++) {
        usersLeague[i] = res.locals.user.leaguesId[i]
    }

    League.find().where('_id').in(usersLeague).then((leagues) => {
        res.status(200).render('myleagues', {leagues: leagues})
    }).catch(error => {
        res.status(500).json(error)
    })
    //const records = await Model.find({ '_id': { $in: ids } })
    
}

module.exports.createMatch = async (req, res) => {
    const { title, slug, usersId, leagueId, firstPlace, secondPlace, KOG, KOA } = req.body
    User.findOne({ email: firstPlace }).then(async (usersFP) => {
        if(!usersFP){
            return res.status(401).render('404')
        }
        User.findOne({ email: secondPlace }).then(async (usersSP) => {
            if(!usersSP){
                return res.status(401).render('404')
            }
            User.findOne({ email: KOG }).then(async (usersKOG) => {
                if(!usersKOG){
                    return res.status(401).render('404')
                }
                User.findOne({ email: KOA }).then(async (usersKOA) => {
                    if(!usersKOA){
                        return res.status(401).render('404')
                    }
                    try{
                        //create the Match in DB
                        const match = await Match.create({ title, slug, usersId , leagueId, firstPlace: usersFP, secondPlace: usersSP, KOG: usersKOG, KOA: usersKOA })
                        User.findOneAndUpdate({"_id": usersId}, { $addToSet: { "matchesId": match._id, } }, function(err){
                            if(err){
                                return res.status(500).render('404')
                            }
                        })
                        User.findOneAndUpdate({"_id": usersFP}, { $addToSet: { "matchesId": match._id, "firstPlaces": match._id, "leaguesId": leagueId} }, function(err){
                            if(err){
                            return res.status(500).render('404')
                            }
                        })
                        User.findOneAndUpdate({"_id": usersSP}, { $addToSet: { "matchesId": match._id, "secondPlaces": match._id, "leaguesId": leagueId} }, function(err){
                            if(err){
                                return res.status(500).render('404')
                            }
                        })
                        User.findOneAndUpdate({"_id": usersKOG}, { $addToSet: { "matchesId": match._id, "KOG": match._id, "leaguesId": leagueId} }, function(err){
                            if(err){
                                return res.status(500).render('404')
                            }
                        })
                        User.findOneAndUpdate({"_id": usersKOA}, { $addToSet: { "matchesId": match._id, "KOA": match._id, "leaguesId": leagueId} }, function(err){
                            if(err){
                                return res.status(500).render('404')
                            }
                        })
                        League.findOneAndUpdate({"_id": leagueId}, { $addToSet: { "matchesId": match._id, "firstPlaces": usersFP, "secondPlaces": usersSP, "KOG": usersKOG, "KOA": usersKOA, "usersId": usersFP, "usersId": usersSP, "usersId": usersKOG, "usersId": usersKOA} }, function(err){
                            if(err){
                                return res.status(500).render('404')
                            }
                        })
                        return res.status(201).render('leagues')
                    } catch (err) {
                        const errors = handleErrors(err)
                        return res.status(201).render('leagues')
                    }
                })
            })
        })
    })
}

module.exports.oneMatch_get = (req, res) => { 
    Match.findOne({ slug: req.params.slug }).then((matches) => {
        User.find({matchesId: matches.id}).then((usersInMatch) =>{
            User.findOne({"_id": matches.firstPlace}).then((firstPlace) => {
                User.findOne({"_id": matches.secondPlace}).then((secondPlace) => {
                    User.findOne({"_id": matches.KOG}).then((KOG) => {
                        User.findOne({"_id": matches.KOA}).then((KOA) => {
                            res.status(200).render('match', {matches: matches, usersInMatch: usersInMatch, firstPlace, secondPlace, KOG, KOA})
                        }).catch(error => {
                            res.status(500).render('404')
                        })
                    }).catch(error => {
                        res.status(500).render('404')
                    })
                }).catch(error => {
                    res.status(500).render('404')
                })
            }).catch(error => {
                res.status(500).render('404')
            })
        }).catch(error => {
            res.status(500).render('404')
        })
    }).catch(error => {
        res.status(500).render('404')
    })
}

module.exports.updateMatch = (req, res) => { 
    Match.findByIdAndUpdate(req.params.id,{$set:req.body}, function(err){
        if(err){
            res.status(500).render('404')
        }
        res.status(200).redirect('../../../leagues')
    })
}

module.exports.addUserToMatch = (req, res) => { 
    const { email } = req.body
    User.find({ email }).then((users) => {
        if(users.length === 0){
            return res.status(401).render('404')
        }
        const [ user ] = users;
        //find the user, if the user already have thet leagueId then send error else add the leagueId to the user and the UserId to the League

        Match.findByIdAndUpdate(req.params.id,{$addToSet: {usersId: user}},function(err, match){
            if(err){
                res.status(500).render('404')
            }
            League.findOneAndUpdate({matchesId: match.id},{$addToSet: {usersId: user, matchesId: req.params.id}},function(err, league){
                if(err){
                    res.status(500).render('404')
                }
                User.findOneAndUpdate({"email": user.email}, { $addToSet: { matchesId: req.params.id, leaguesId: league.id } }, function(err){
                    if(err){
                        res.status(500).render('404')
                    }
                })
            })
        })
        res.status(200).redirect('../../../leagues')
    })
}

module.exports.deleteMatch = async (req, res) => {
    Match.findByIdAndDelete(req.params.id).then((match) => {
        User.updateMany(
            { },
            { $pull : {matchesId: req.params.id, firstPlaces: req.params.id, secondPlaces: req.params.id, KOG: req.params.id, KOA: req.params.id } },
            function(err, data) { 
                if(err){
                    res.status(500).render('404')
                }
             })
             League.updateMany(
                { },
                { $pull : {matchesId: req.params.id, firstPlaces: match.firstPlace, secondPlaces: match.secondPlace, KOG: match.KOG, KOA: match.KOA} },
                function(err, data) { 
                    if(err){
                        res.status(500).render('404')
                    }
            }).catch(error => {
                res.status(200).redirect('/')
            })
        }
        ).catch(error => {
            res.status(500).render('404')
        })
}