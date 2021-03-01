import { Publisher, Subjects, TicketCreatedEvent } from '@ticketing-org/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}