import mongoose from 'mongoose';

// An interface that describes the properties that are required to create a new payment.
interface PaymentAttrs {
    orderId: string;
    stripeId: string;
}

// An interface that describes the properties that a payment model has
// model represents entire collection of data
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}

// An interface that describes the properties that a payment document has
// document represents a single record
// not mentioning 'id' here since it's already exists in mongoose document
interface PaymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// adding additional build method to our payment model.
// Remember the entire goal of this build function was to just allow typescript to do some validation or type checking on the properties we were trying to use to create a new record.
paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };