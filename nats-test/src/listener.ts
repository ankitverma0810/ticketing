import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import { TicketCreatedListener } from './events/ticket-created-listener';

//connecting to NAT streaming server
//stand refers to client
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
	url: 'http://localhost:4222'
});

//this function will be executed after the client has successfully connected to the NAT streaming server
stan.on('connect', () => {
	console.log('Listener connected to NATS');

	// Once connection will be close down
	// Process will be removed from the subscription list of the channel immediately and server will stop sending the messages.
	stan.on('close', () => {
		console.log('NATS connection closed');
		process.exit();
	});

	new TicketCreatedListener(stan).listen();
});

// Below code will get executed whenever the process will get close down.
// These are the signals that are sent to this process whenever 'ts-node-dev' tries to restart our program or anytime you hit CTRL+C at your terminal.
// Our client is going to reach out to the NAT streaming server and say don't send me any more messages.
//This signals will not work on WINDOWS machine

//interrupt signals
process.on('SIGINT', () => stan.close());
//terminate signals
process.on('SIGTERM', () => stan.close());