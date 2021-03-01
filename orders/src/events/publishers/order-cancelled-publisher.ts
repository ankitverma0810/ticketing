import { Publisher, Subjects, OrderCancelledEvent } from '@ticketing-org/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}