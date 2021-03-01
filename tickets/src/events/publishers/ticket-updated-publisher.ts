import { Publisher, Subjects, TicketUpdatedEvent } from '@ticketing-org/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}