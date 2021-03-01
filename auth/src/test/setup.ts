import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../app';

declare global {
	namespace NodeJS {
		interface Global {
			signin(): Promise<string[]>;
		}
	}
}

let mongo: any;
beforeAll(async () => {
	//setting up env variable to be used inside the app
	process.env.JWT_KEY = 'asdf';

	//setting up mongo and moongose
	mongo = new MongoMemoryServer();
	const mongoUri = await mongo.getUri();

	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
});

//deleting all the collections
beforeEach(async () => {
	const collections = await mongoose.connection.db.collections();

	for(let collection of collections) {
		await collection.deleteMany({});
	}
});

//stopping mongo and moongose
afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

// global function to be used for authentication and provide cookie
// used in current-user.test.ts file
global.signin = async () => {
	const email = 'test@test.com';
	const password = '12345678';

	const response = await request(app)
		.post('/api/users/signup')
		.send({ email, password })
		.expect(201);

	const cookie = response.get('Set-Cookie');
	return cookie;
};