import { Publisher, Subjects, OrderCreatedEvent } from '@ticketing-org/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}