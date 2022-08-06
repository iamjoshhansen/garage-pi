import { Observable } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { ActivationEvent } from '../schedule-observer';

export class ApiEventEmitter {
  public readonly id: string;
  public readonly events: Observable<ActivationEvent>;
  private readonly ioServer: Server;

  constructor(params: {
    id: string;
    events: Observable<ActivationEvent>;
    ioServer: Server;
  }) {
    this.id = params.id;
    this.events = params.events;
    this.ioServer = params.ioServer;

    const sockets = new Set<Socket>();

    this.events.subscribe(update => {
      console.log(
        `Emitting '${this.id}' to ${sockets.size} sockets with `,
        update,
      );
      this.ioServer.emit(this.id, update);
    });

    this.ioServer.on('connection', (socket: Socket) => {
      sockets.add(socket);
      console.log(`Sprinkler has connection. Count: ${sockets.size}`);

      socket.on('disconnect', () => {
        sockets.delete(socket);
        console.log(`Sprinkler dropped connection: Count: ${sockets.size}`);
      });
    });

    // this.ioServer.on('connection', (client: Socket) => {
    //   console.log(`Sprinkler has connection`);

    //   // client.on(this.id, data => {
    //   //   console.log({ from: 'sprinklers', data });
    //   // });

    //   const disconnect = new Subject<void>();

    //   this.events.pipe(takeUntil(disconnect)).subscribe(update => {
    //     console.log(`Emitting: ${this.id} with `, update);
    //     client.emit(this.id, update);
    //   });

    //   client.on('disconnect', () => {
    //     console.log(`Sprinkler dropped connection`);
    //     disconnect.next();
    //   });
    // });
  }
}
