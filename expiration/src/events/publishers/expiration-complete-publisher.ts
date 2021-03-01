import { Publisher, Subjects, ExpirationCompleteEvent } from '@ticketing-org/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}