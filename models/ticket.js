const {Schema, model} = require('mongoose');

const TicketSchema = Schema({
    user_id: {
        type: String,
        required: [true, 'User id required']
    },
    tickets: {
        type: Number,
        default: 0
    }
});

module.exports = model('Ticket', TicketSchema);