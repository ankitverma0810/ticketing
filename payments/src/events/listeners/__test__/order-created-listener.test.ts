import { OrderCreatedEvent, OrderStatus } from '@ticketing-org/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCreatedListener } from './../order-created-listener';
import { natsWrapper } from './../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create the fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'abcd',
        version: 0,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 20
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};


it('replicates the order info', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertion to make sure  a ticket was created!
    const order = await Order.findById(data.id);
    expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertion to make sure  ack function is called
    expect(msg.ack).toHaveBeenCalled();
});