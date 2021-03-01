import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@ticketing-org/common';

import { User } from '../models/user';

const router = express.Router();

router.post(
	'/api/users/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({ min: 4, max: 20 })
			.withMessage('Password must be between 4 and 20 charaters')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;

		//checking if email already in use
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			throw new BadRequestError('Email in use');
		}

		//saving the user
		const user = User.build({ email, password });
		await user.save();

		//Generate JWT
		//process.env.JWT_KEY: name of the key we have defined in our deployment yaml file.
		const userJwt = jwt.sign(
			{
				id: user.id,
				email: user.email
			},
			process.env.JWT_KEY!
		);

		//Store it on session object
		// Generate JSON web token and then we store it on that session object. Remember that such an object is going to be turned into a string by Cookie session. A cookie session Middleware is then going to attempt to send this cookie back over to the user's browser
		req.session = {
			jwt: userJwt
		}

		res.status(201).send(user);

	}
);

export { router as signupRouter };