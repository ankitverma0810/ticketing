import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@ticketing-org/common';

import { Order } from './order';

//An interface that describes the properties that are required to create a new user.
interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}

//An interface that describes the properties that a user model has
//model represents entire collection of data
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

//An interface that describes the properties that a user document has
//document represents a single record
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
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

// If you want to define any method inside model then use 'statics' property inside schema.
// adding additional 'build' and 'findByEvent' methods to our user model.
ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    })
};

// Remember the entire goal of this build function was to just allow typescript to do some validation or type checking on the properties we were trying to use to create a new record.
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
};

// If you want to define any method inside document then use 'methods' property inside schema.
// make sure to define this method with 'function' keyword
ticketSchema.methods.isReserved = async function () {
    // this === the ticket document
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };