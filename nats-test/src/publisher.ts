import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

//connecting to NAT streaming server
//stand refers to client
const stan = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
});

//this function will be executed after the client has successfully connected to the NAT streaming server
stan.on('connect', async () => {
    console.log('Publisher connected to NATS');

    const publisher = new TicketCreatedPublisher(stan);
    try {
        await publisher.publish({
            id: '123',
            title: 'concert',
            price: 20
        });
    } catch (err) {
        console.log(err);
    }
});