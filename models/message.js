const {Schema, model} = require('mongoose');

const MessageSchema = Schema({
    join_message: {
        type: String,
        required: [true, 'Message required']
    }
});

module.exports = model('Message', MessageSchema);