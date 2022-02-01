import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Train, RawTrain } from '../model/train.model';
import { WebSocketService } from './websocket.service';
import { environment } from '../../environments/environment';

/**
 * This service handles the websocket-specific process for connecting to train data
 */

@Injectable()
export class TrainsWebSocketService {

    public messages: Subject<RawTrain>;

    constructor(private wsService: WebSocketService) {

        this.messages = wsService
        .connect(environment.websocketUrl).pipe(
            tap(response => {
                const data = JSON.parse(response.data);
                if (data.object_type === 'Register') {
                    const connectMe = {
                        object_type: 'Filter',
                        object_type_version: 1,
                        connection_id: data.unique_id,
                        object_type_filter: ['Event']
                    };
                    wsService.send(JSON.stringify(connectMe));
                }
            }),
            map(
            (response: MessageEvent): RawTrain => {
                const data = JSON.parse(response.data);
                return new RawTrain().deserialize(data);
            }
        )) as Subject<RawTrain>;
    }

    close() {
        this.wsService.close();
    }

}

/** Websocket Connection Explained
 * On connect receive a message like this:
 * {
 * "object_type":"Register",
 * "object_type_version":1,
 * "unique_id":352
 * }
 * 
 * Send back a message like this:
 * {
 * "object_type": "Filter", 
 * "object_type_version": 1, 
 * "connection_id": 352, 
 * "object_type_filter": ["Event"]
 * }
 * 
 * Then the stream then starts with messages like:
 * {
 * "object_type":"Event",
 * "object_type_version":6,
 * "event_id":217724789,
 * "fibre_line_id":11,
 * "channel":1,
 * "event_type":"train",
 * "confidence":0.9984,
 * "time":"2020-03-05T17:02:58.000Z",
 * "event_track_uuid":"b3fa5874-7ae4-4170-833b-74d194d78428",
 * "event_track_id":7238919,
 * "application":"general",
 * "amplitude":0,
 * "position":7741.31,
 * "width":293.835,
 * "velocity":16.9106,
 * "acceleration":0,
 * "latitude":51.077902774135403,
 * "longitude":-114.121288087894,
 * "tags":[{"tag_id":398185943,"key":"channelID","value":"1"}]
 * }
 */
 
