import { Publisher, Subjects, PaymentCreatedEvent } from '@ticketing-org/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}