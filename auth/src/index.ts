import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
	console.log('Starting up the auth service...');
	
	// validating whether secret key has been set in the deployment file or not.
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined');
	}

	try {
		//if we will mention auth in the connect URL then mongoose will create auth DB for us automatically
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