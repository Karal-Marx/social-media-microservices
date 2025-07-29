const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    pubicId : {
        type : String,
        required : true
    },
    orginalName : {
        type : String,
        required : true
    },
    url : {
        type : String,
        required : true
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    }
}, {timestamps : true});


const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;