const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    markdown: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }/*,
    slug:{
        type: String,
        requrid: true,
        unique: true
    }*/
})

/*articleSchema.pre('validate', function(next){
    if (this.title){
        this.slug = slugify(this.title, { low: true, strict: true})
    }
    next()
})*/

module.exports = mongoose.model('Forms', articleSchema)