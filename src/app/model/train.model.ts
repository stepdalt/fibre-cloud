import { Deserializable } from './deserializable.model';

export class RawTrain implements Deserializable {
    object_type: string;
    object_type_version: number;
    event_id: number;
    fibre_line_id: number;
    channel: number;
    event_type: string;
    confidence: number;
    time: string;
    event_track_uuid: string;
    event_track_id: number;
    application: string;
    amplitude: number;
    position: number;
    width: number;
    velocity: number;
    acceleration: number;
    latitude: number;
    longitude: number;
    tags: [Tag];

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    ToTrain(): Train {
        let train = new Train();
        train.userID = 0;
        train.event_track_id = this.event_track_id;
        train.fiber_line_id = this.fibre_line_id;
        train.confidence = this.confidence;
        train.timestamp = this.time;
        train.recievedtime = this.time;
        train.position = {
            lat: this.latitude,
            long: this.longitude,
            alt: 0
        };
        train.velocity = {
            speed: this.velocity,
            heading: this.position,
            acceleration: this.acceleration
        };

        return train;
    }
}

export class Tag {
    tag_id: number;
    key: string;
    value: string;
}

export class Train {
    userID: number;
    event_track_id: number;
    fiber_line_id: number;
    confidence: number;
    timestamp: string;
    recievedtime: string;
    position: {
        lat: number,
        long: number,
        alt: number
    };
    velocity: {
        speed: number,
        heading: number,
        acceleration: number
    };
}
