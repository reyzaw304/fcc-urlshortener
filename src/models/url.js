let mongoose = require('mongoose');

let urlSchema = new mongoose.Schema({
    original_url: {
        type: String, required: true, unique: true
    },
    short_url: { type: Number, required: true, unique: true }
});

let Url = mongoose.model('Url', urlSchema);

module.exports = Url;