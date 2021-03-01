import request from 'supertest';
import mongoose from "mongoose";

import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('fetches the order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const user = global.signin();
    // Make a request to build an order with this ticket
    const order = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make request to fetch the order
   const fetchedOrder = await request(app)
        .get(`/api/orders/${order.body.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.body.id).toEqual(order.body.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    // Make a request to build an order with this ticket
    const order = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make request to fetch the order
   const fetchedOrder = await request(app)
        .get(`/api/orders/${order.body.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(401);
});