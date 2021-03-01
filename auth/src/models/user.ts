import mongoose from 'mongoose';

import { Password } from './../services/password';

//An interface that describes the properties that are required to create a new user.
interface UserAttrs {
    email: string;
    password: string;
}

//An interface that describes the properties that a user model has
//model represents entire collection of data
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

//An interface that describes the properties that a user document has
//document represents a single record
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

//using pre-hook
userSchema.pre('save', async function(done) {
    if(this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

//adding additional build method to our user model.
//Remember the entire goal of this build function was to just allow typescript to do some validation or type checking on the properties we were trying to use to create a new record.
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };