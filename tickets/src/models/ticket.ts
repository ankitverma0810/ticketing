import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An interface that describes the properties that are required to create a new user.
interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

//An interface that describes the properties that a user model has
//model represents entire collection of data
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

//An interface that describes the properties that a user document has
//document represents a single record
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// Setting updateIfCurrentPlugin and telling mongoose to rename versionKey i.e. __V to version
// updateIfCurrentPlugin only works while updating records. It check the version of the record and accordinly update the same.
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

//adding additional build method to our user model.
//Remember the entire goal of this build function was to just allow typescript to do some validation or type checking on the properties we were trying to use to create a new record.
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };