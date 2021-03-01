import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
	console.log('Starting orders service...');
	
	// validating whether secret key has been set in the deployment file or not.
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}
	if (!process.env.NATS_CLIENT_ID) {
		throw new Error('NATS_CLIENT_ID must be defined');
	}
	if (!process.env.NATS_URL) {
		throw new Error('NATS_URL must be defined');
	}
	if (!process.env.NATS_CLUSTER_ID) {
		throw new Error('NATS_CLUSTER_ID must be defined');
	}

	try {
		// clusterId: defined in the nats-depl file
		// clientId: any random id
		// url: name of the service defined in the nats-depl file
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID, 
			process.env.NATS_CLIENT_ID, 
			process.env.NATS_URL
		);
		// Once connection will be close down
		// Process will be removed from the subscription list of the channel immediately and server will stop sending the messages.
		natsWrapper.client.on('close', () => {
			console.log('NATS connection closed');
			//if anytime NATS connection will be closed then tickets pod will get restarted automatically.
			process.exit();
		});
		//interrupt signals
		process.on('SIGINT', () => natsWrapper.client.close());
		//terminate signals
		process.on('SIGTERM', () => natsWrapper.client.close());

		// Listeners
		new ExpirationCompleteListener(natsWrapper.client).listen();
		new TicketCreatedListener(natsWrapper.client).listen();
		new TicketUpdatedListener(natsWrapper.client).listen();
		new PaymentCreatedListener(natsWrapper.client).listen();

		// mongoose connection
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		});
		console.log('Connected to MongoDB');
	} catch (err) {
		console.error(err);
	}

	app.listen(3000, () => {
		console.log('Listening on port 3000');
	});
};

start();