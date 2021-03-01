import { OrderCancelledEvent } from '@ticketing-org/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCancelledListener } from './../order-cancelled-listener';
import { natsWrapper } from './../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = new mongoose.Types.ObjectId().toHexString();

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });
    ticket.set({ orderId });
    await ticket.save();

    // create the fake data event
    const data: OrderCancelledEvent['data'] = {
        version: 1,
        id: orderId,
        ticket: {
            id: ticket.id
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};


it('update ticket, publishes an event, and acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertion to make sure  a ticket was created!
    const ticket = await Ticket.findById(data.ticket.id);
    expect(ticket!.orderId).toBeUndefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});