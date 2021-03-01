import Router from 'next/router';
import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';

import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    });

    const renderOrder = () => {
        if (timeLeft < 0) {
            return <p>Order Expired!</p>;
        }
        return (
            <div>
                <p>Time left to pay: {timeLeft} seconds</p>
                <StripeCheckout
                    token={({ id }) => doRequest({ token: id })}
                    stripeKey="pk_test_51INdcWEZ23gbMrRGO0DS9E8OBWMasrB6ZFAYaK081LA53B0dDOwnYCH64AoagYabcvYLA1kdP01y18Jal0RHsp4L00h4g9w6NA"
                    amount={order.ticket.price * 100}
                    email={currentUser.email}
                    currency="INR" />
            </div>
        );
    }

    return (
        <div>
            <h1>{order.ticket.title}</h1>
            {renderOrder()}
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data };
}

export default OrderShow;