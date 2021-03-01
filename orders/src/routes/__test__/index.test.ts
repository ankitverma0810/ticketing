import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    });
    await ticket.save();
    return ticket;
}

it('fetched orders for a particular user', async () => {
    const user1 = global.signin();
    const user2 = global.signin();

    // create three tickets
    const ticket1 = await buildTicket();
    const ticket2 = await buildTicket();
    const ticket3 = await buildTicket();

    // create one order as User #1
    const order1 = await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ ticketId: ticket1.id })
        .expect(201);

    // create two order as User #2
    const order2 = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket2.id })
        .expect(201);

    const order3 = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket3.id })
        .expect(201);

    // Make request to get orders for user #2
    const orders = await request(app)
        .get('/api/orders')
        .set('Cookie', user2)
        .expect(200);

    // Make sure we only get the orders for user #2
    expect(orders.body.length).toEqual(2);
    expect(orders.body[0].id).toEqual(order2.body.id);
    expect(orders.body[1].id).toEqual(order3.body.id);
    expect(orders.body[0].ticket.id).toEqual(ticket2.id);
    expect(orders.body[1].ticket.id).toEqual(ticket3.id);
});