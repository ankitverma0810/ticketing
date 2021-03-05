import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
	console.log('Starting.....');
	
	// validating whether secret key has been set in the deployment file or not.
	if (!process.env.NATS_CLIENT_ID) {
		throw new Error('NATS_CLIENT_ID must be defined');
	}
	if (!process.env.NATS_URL) {
		throw new Error('NATS_URL must be defined');
	}
	if (!process.env.NATS_CLUSTER_ID) {
		throw new Error('NATS_CLUSTER_ID must be defined');
	}
	if (!process.env.REDIS_HOST) {
		throw new Error('REDIS_HOST must be defined');
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

		// listener
		new OrderCreatedListener(natsWrapper.client).listen();
	} catch (err) {
		console.error(err);
	}
};

start();