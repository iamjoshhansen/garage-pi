import { Subject } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { ActivationEvent } from '../schedule-observer';

export class ApiEventListener {
  public readonly id: string;
  private readonly ioServer: Server;

  private readonly eventsSubject = new Subject<ActivationEvent>();
  public readonly events$ = this.eventsSubject.asObservable();

  constructor(params: { id: string; ioServer: Server }) {
    this.id = params.id;
    this.ioServer = params.ioServer;

    const sockets = new Set<Socket>();

    this.ioServer.on('connection', (socket: Socket) => {
      sockets.add(socket);
      console.log(`Sprinkler has connection. Count: ${sockets.size}`);

      socket.on('disconnect', () => {
        sockets.delete(socket);
        console.log(`Sprinkler dropped connection: Count: ${sockets.size}`);
      });

      //////

      socket.on(this.id, (update: ActivationEvent) =>
        this.handleUpdate(update),
      );
    });
  }

  handleUpdate(update: ActivationEvent) {
    console.log(`Recieved ${update.event} to be ${update.active}`);
    this.eventsSubject.next(update);
  }
}
