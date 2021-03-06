const mongoose = require('mongoose')
const slugify = require('slugify');

const LeagueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter title"],
        unique: true,
        minlength: [6, 'Title must be at least 6 charcters'],
        maxlength: [50, 'Title must be under 50 charcters']
    },
    slug: { 
        type: String,
        required: true,
        unique: true
    },
    usersId: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    matchesId: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'match'
    }],
    firstPlaces: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'match'
    }],
    secondPlaces: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'match'
    }],
    KOG: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'match'
    }],
    KOA: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'match'
    }],
},
{
    timestamps: true,
}
)

LeagueSchema.pre('validate', function(next) {
    if(this.title){
        this.slug = slugify(this.title, { lower: true,
        strict: true })
    }

    if(this.markedown){
        this.sanitizedHtml = dompurify.sanitize(marked(this.markedown));
    }
    
    next();

})

const League = mongoose.model('league', LeagueSchema)
module.exports = League