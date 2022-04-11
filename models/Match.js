const mongoose = require('mongoose')
const slugify = require('slugify');

const MatchSchema = new mongoose.Schema({
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
    leagueId: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'league'
    },
},
{
    timestamps: true,
}
)

MatchSchema.pre('validate', function(next) {
    if(this.title){
        this.slug = slugify(this.title, { lower: true,
        strict: true })
    }

    if(this.markedown){
        this.sanitizedHtml = dompurify.sanitize(marked(this.markedown));
    }
    
    next();

})

const Match = mongoose.model('match', MatchSchema)
module.exports = Match