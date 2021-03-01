import { Stan, Message } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
	subject: Subjects;
	data: any;
}

export abstract class Listener<T extends Event> {
	abstract subject: T['subject'];
	abstract queueGroupName: string;
	abstract onMessage(data: T['data'], msg: Message): void;
	private client: Stan;
	protected ackWait = 5 * 1000;

	constructor(client: Stan) {
		this.client = client;
	}

	/**
	 * 'setDeliverAllAvailable', 'setDurableName' and 'queue group names' are very tightly coupled with each other.
	 * setDeliverAllAvailable: get all the events that's been emitted in the past
	 * setAckWait: Acknowledgement wait time. Default is 30 seconds.
	 * setDurableName: keep track of all the different events that have gone to this subscription
	 * queue group:
        * Will pass the message to one of the subscriptions of the queue group. 
        * make sure that we do not accidentally dumped the durable name even if all of our services restart for a very brief period of time.
	**/
	subscriptionOptions() {
		return this.client
			.subscriptionOptions()
			.setDeliverAllAvailable()
			.setManualAckMode(true)
			.setAckWait(this.ackWait)
			.setDurableName(this.queueGroupName);
	}

	listen() {
		// subscribing to a channel and a queue group
		const subscription = this.client.subscribe(
			this.subject,
			this.queueGroupName,
			this.subscriptionOptions()
		);
		
		// Once message will be received. It will get parsed and onMessage methode will be invoked. 
		subscription.on('message', (msg: Message) => {
			console.log(`Message received ${this.subject} / ${this.queueGroupName}`);
			const parsedData = this.parseMessage(msg);
			this.onMessage(parsedData, msg);
		});
	}

	// returning message data
	parseMessage(msg: Message) {
		const data = msg.getData();
		return typeof data === 'string'
			? JSON.parse(data)
			: JSON.parse(data.toString('utf-8'));
	}
}