import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { Train } from '../model/train.model';
import { TrainsWebSocketService } from '../service/trains.websocket.service';

/**
 * This page displays the raw data from the train data websocket for purer analysis.
 */

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {


  constructor(private trainsWsService: TrainsWebSocketService) {
      this.trainsWsService.messages.subscribe(trains => {
        console.log('Response from websocket: ' + JSON.stringify(trains));
        
      });
    }

  ngOnInit() {

  }
}
