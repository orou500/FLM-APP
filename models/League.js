const mongoose = require('mongoose')

const LeagueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter title"],
        unique: true,
        minlength: [6, 'Title must be at least 6 charcters'],
        maxlength: [50, 'Title must be under 50 charcters']
    }
})

const User = mongoose.model('league', LeagueSchema)
module.exports = User