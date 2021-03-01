import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
	namespace NodeJS {
		interface Global {
			signin(): string[];
		}
	}
}

// jest will replace the import of 'nats-wrapper.ts' with '__mock__/nats-wrapper.ts' automatically in all test files.
// Also clearing mocks in the beforeEach method below
jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
	// Since we will not run the test inside container so defining env variable to be used inside the tests
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
	jest.clearAllMocks();

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
global.signin = () => {
	//build a JWT payload. { id, email }
	const payload = {
		id: new mongoose.Types.ObjectId().toHexString(),
		email: 'test@test.com'
	};

	//create the JWT
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	//Build session object, { jwt: MY_JWT }
	const session = { jwt: token };

	//Turns that session into JSON
	const sessionJSON = JSON.stringify(session);

	//Take JSON and encode it as base64
	const base64 = Buffer.from(sessionJSON).toString('base64');

	//return a string have the cookie with the encoded data
	return [`express:sess=${base64}`];
};