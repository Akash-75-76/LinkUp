import mongoose from 'mongoose';

const ConnectionSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    connectionId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status:{
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
});

const Connection = mongoose.model('Connection', ConnectionSchema);
export default Connection;