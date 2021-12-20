const {Schema, model} = require('mongoose');

const ChannelSchema = Schema({
    channel_id: {
        type: String,
        required: [true, 'Channel id required']
    }
});

module.exports = model('Channel', ChannelSchema);