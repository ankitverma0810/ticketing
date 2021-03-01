import express from 'express';
//to handle async errors
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@ticketing-org/common';

import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes/index';
import { deleteOrderRouter } from './routes/delete';

const app = express();
//enabling proxy. express is aware that it's behind a proxy of ingress ngingx and to make sure that it should still trust traffic as being secure even though it's coming from that proxy.
app.set('trust proxy', true);
app.use(json());
// configuring cookieSession. Don't encrypt the cookie and ony use cookies if user visit our application over an HTTPS connection.
app.use(
	cookieSession({
		signed: false
		//secure: process.env.NODE_ENV !== 'test'
	})
);
//using currentUser middleware for authorization purpose
app.use(currentUser);

app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all('*', () => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };