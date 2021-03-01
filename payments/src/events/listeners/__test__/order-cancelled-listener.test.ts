import { OrderCancelledEvent, OrderStatus } from '@ticketing-org/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCancelledListener } from './../order-cancelled-listener';
import { natsWrapper } from './../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    });
    await order.save();

    // create the fake data event
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString()
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};


it('updates the status of the order', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertion to make sure  a ticket was created!
    const order = await Order.findById(data.id);
    expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertion to make sure  ack function is called
    expect(msg.ack).toHaveBeenCalled();
});