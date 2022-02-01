import { Injectable } from '@angular/core';
import * as Rx from 'rxjs';

/**
 * This is a generic service method for connecting to a websocket, handling connection,
 *  message reciept, message sending, and closing the connection
 */

@Injectable()
export class WebSocketService {
  constructor() { }

  private subject: Rx.Subject<MessageEvent>;
  private ws: WebSocket;

  public connect(url): Rx.Subject<MessageEvent> {
      if (!this.subject) {
          this.subject = this.create(url);
      }
      return this.subject;
  }

  public close() {
    this.ws.close();
  }

  public send(message) {
    if (this.subject) {
      this.ws.send(message);
    }
  }

  private create(url): Rx.Subject<MessageEvent> {
      this.ws = new WebSocket(url);

      const observable = Rx.Observable.create(
          (obs: Rx.Observer<MessageEvent>) => {
            this.ws.onmessage = obs.next.bind(obs);
            this.ws.onerror = obs.error.bind(obs);
            this.ws.onclose = obs.complete.bind(obs);

              return this.ws.close.bind(this.ws);
          }
      );

      const observer = {
          next: (data: Object) => {
              if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(data));
              }
          }
      };

      return Rx.Subject.create(observer, observable);
  }
}
