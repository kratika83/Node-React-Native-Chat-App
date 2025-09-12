import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String, // hashed
    online: {
        type: Boolean,
        default: false
    },
    lastSeen: Date
},
    {
        timestamps: true,
        collection: 'Users'
    }
);

const userModel = mongoose.model('Users', UserSchema);
export default userModel;