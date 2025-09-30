import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
    school:{
        type: String,
        default: null
    },
    degree:{
        type: String,
        default: null
    },
    fieldOfStudy:{
        type: String,
        default: null
    },
});

const WorkSchema = new mongoose.Schema({
    company:{
        type: String,
        default: null   
    },
    position:{
        type: String,
        default: null

    },

    years:{
        type: String,
        default: null
    }
});


const ProfileSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    bio:{
        type: String,
        default: null
    },
    currentPost:{
        type: String,
        default: null
    },
    pastWork:{
        type: [WorkSchema],
        default: []
    },
    education:{
        type: [EducationSchema],
        default: []

    }
});

const Profile = mongoose.model('Profile', ProfileSchema);
export default Profile;