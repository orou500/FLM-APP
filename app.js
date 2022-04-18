const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const authRoutes = require('./routes/authRoutes')
const leagueRoutes = require('./routes/leagueRoutes')
const cookieParaser = require('cookie-parser')
const League = require('./models/League')
const Match = require('./models/Match')
const User = require('./models/User')
const { checkAuth, checkUser, checkIfAdmin } = require('./middlewares/checkAuth')
const jwt = require('jsonwebtoken');


mongoose.connect(`mongodb+srv://sizex:1qa2ws3ed@league.jbqmf.mongodb.net/test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
    console.log('mongoDB Connected!')
});

app.locals.siteName = "FLM"

app.use(morgan("dev"))
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParaser())
app.use(express.urlencoded({
    extended: true
}))
app.use(methodOverride('_method'))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    if(req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET")
        return res.status(200).json({})
    }
    next()
})
app.use(checkUser)

//register view engine
app.set('view engine', 'ejs')

//view routes
app.get('/',(req, res) => {
    res.render('index')
})
app.get('/profile',(req, res) => {
    res.render('profile')
})
app.get('/user/edit/:id', async (req, res) => {
    const user = await User.findById(req.params.id)
    res.render('edituser', {user});
})
app.get('/leagues/add', checkAuth, checkIfAdmin, (req, res) => {
    res.render('addleague')
})
app.get('/leagues/:id/addmatch', checkAuth, (req, res) => {
    let id = req.params.id
    User.find({leaguesId: id}).then((usersInLeague) =>{
        res.render('addmatch', {id, usersInLeague})
    })
})
app.get('/league/edit/:id', checkIfAdmin,async (req, res) => {
    const league = await League.findById(req.params.id)
    res.render('editleague', {league: league});
})
app.get('/league/match/edit/:id', checkAuth,async (req, res) => {
    const match = await Match.findById(req.params.id)
    User.find({matchesId: req.params.id}).then((usersInMatches) =>{
        res.render('editmatch', {match: match, usersInMatches});
    })
})
app.get('/user/verify/:id', (req, res) => {
    let id = req.params.id
    User.findOne({id}).then((user) =>{
        if(user.verify === false){
            res.status(500).render('404')
        }
        User.findByIdAndUpdate(user.id,{$set:{verify: true}}, function(err){
            if(err){
                console.log(err)
                res.status(500).render('404')
            }
            const maxAge = 3 * 24 * 60 * 60
            const createToken = (id) => {
                return jwt.sign({ id }, process.env.JWT_KEY, {
                    expiresIn: maxAge,
                })
            }
            const token = createToken(user._id)
            res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
            res.render('Verify', {user})
        })
    })
})
app.use(authRoutes)
app.use(leagueRoutes)


app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    res.render('404')
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;