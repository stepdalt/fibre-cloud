import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { interval } from 'rxjs';
import { latLng, tileLayer, marker, circleMarker, divIcon, polyline, featureGroup, Map } from 'leaflet';
import { Train } from '../model/train.model';
import { TrainsWebSocketService } from '../service/trains.websocket.service';

/**
 * This page displays the City of Calgary trains movement in realtime, tracked using fibre optic data, transmitted via websocket.
 * It keeps some location history to show a polygon path representation of the train instead of just a current point in time.
 */

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {
  map: Map;
  cleanupTimer: any;
  featureLayer = featureGroup();
  trailLayer = featureGroup();
  activeTrains: Train[];
  activeTrain: Train;

  // Init the map layers using the City of Calgary tiles
  options: object = {
    layers: [
      tileLayer(`https://gis.calgary.ca/arcgis/rest/services/pub_Basemap/CalgaryBasemap_LightGreyRegional_WMASP/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 18, attribution: '...' }),
      tileLayer(`https://gis.calgary.ca/arcgis/rest/services/pub_Basemap/CalgaryBasemap_WMASP_PNG/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 18, attribution: '...' }),
      this.featureLayer,
      this.trailLayer
    ],
    zoom: 11,
    center: latLng(51.05, -114.063)
  };

  // Init connection to the websocket
  constructor(private trainsWsService: TrainsWebSocketService) {
    this.trainsWsService.messages.subscribe(message => {
      console.log('Response from websocket: ' + JSON.stringify(message));
      if (message.object_type === 'Event') {
        this.markTrain(message.ToTrain());
      }
    });
  }

  // Set new array of known trains
  ngOnInit() {
    this.activeTrains = [];
    // this.mapClean();
  }

  onMapReady(map: Map) {
    this.map = map;
  }

  /**
    * @protected
    * @returns {none}
    * this function attempts to clean up stranded markers NOTE: for now we don't want to clean them up. Uncomment if desired
    */
  /*mapClean(): void {
    this.cleanupTimer = interval(65000);
    this.cleanupTimer.subscribe(time => {
      this.featureLayer.getLayers().forEach( m => {
        if (m.checkLocation) {
          if (m.checkLocation.distanceTo(m.getLatLng()) <= 10) {
            const existing = this.activeTrains.findIndex(item => item.event_track_id === m.id);
            this.activeTrains.splice(existing, 1);
            this.featureLayer.removeLayer(m);
            const existingTrails = this.trailLayer.getLayers();
            const existingTrail = existingTrails.find(fmarker => fmarker.id === m.id);
            if (existingTrail) {
              this.trailLayer.removeLayer(existingTrail._leaflet_id);
            }
          } else {
            m.checkLocation = new latLng(m.getLatLng().lat, m.getLatLng().lng);
          }
        } else {
          m.checkLocation = new latLng(m.getLatLng().lat, m.getLatLng().lng);
        }
      });
    });
  }*/

  /**
  * @protected
  * @returns {none}
  * this function takes train data and marks it on the map
  */
  markTrain(train: Train): void {
    if (train) {
      if (this.activeTrains) {
        const trainLatLng = latLng(train.position.lat, train.position.long);

        // If new train entry
        if (!this.activeTrains.some((item) => item.event_track_id === train.event_track_id)) {
          this.activeTrains.push(train);
          const popupContent = `
        <div>${train.event_track_id}</div>
      `;

          // setup the marker
          const tMarker = marker(trainLatLng, {
            icon: divIcon({
              iconSize: [15, 15],
              iconAnchor: [7, 8],
              html: `<div><div class='circle-marker'></div><span class='train-id-label'>TrainID: ${train.event_track_id}</span></div>`
            })
          });
          /*circleMarker(trainLatLng, {
            color: '#ff0000',
            stroke: true
          });*/

          tMarker.id = train.event_track_id;
          tMarker.bindPopup(popupContent, { minWidth: 250 });

          // Add the marker to the maplayer
          this.featureLayer.addLayer(tMarker);
        }
        // If existing train
        // tslint:disable-next-line:one-line
        else {
          const existing = this.activeTrains.findIndex(item => item.event_track_id === train.event_track_id);
          this.activeTrains[existing] = train;
          const existingMarkers = this.featureLayer.getLayers();
          const existingMarker = existingMarkers.find(fmarker => fmarker.id === train.event_track_id);
          const oldLocation = existingMarker.getLatLng();
          const trail = polyline([oldLocation, trainLatLng], {
            color: '#dd0000'
          });
          trail.id = train.event_track_id;
          const existingTrails = this.trailLayer.getLayers();
          const existingTrail = existingTrails.find(fmarker => fmarker.id === train.event_track_id);

          const changeMarker = this.featureLayer.getLayer(existingMarker._leaflet_id);

          this.featureLayer.removeLayer(existingMarker._leaflet_id);
          if (existingTrail) {
            this.trailLayer.removeLayer(existingTrail._leaflet_id);
          }
          changeMarker.setLatLng(trainLatLng);
          this.featureLayer.addLayer(changeMarker);
          this.trailLayer.addLayer(trail);
        }
      }
    }
  }
}
