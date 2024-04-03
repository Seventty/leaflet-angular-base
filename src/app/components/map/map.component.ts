import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import "@geoman-io/leaflet-geoman-free";
import { IModalConfig } from 'src/app/shared/modal/IModalConfig';
import { IModalOption } from 'src/app/shared/modal/IModalOptions';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { saveAs } from 'file-saver';
import { IBaseLayer } from 'src/app/shared/interfaces/IBaseLayer';
import { ToastService } from 'src/app/shared/services/toast/toast.service';
import { FileManagerService } from 'src/app/shared/services/file-manager/file-manager.service';
import { GeoJsonResult } from 'src/app/shared/types/geoJsonResult.type';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  private map?: L.Map;
  private featureGroup?: L.FeatureGroup;
  private defaultMapLocation: L.LatLngExpression = [19.026319, -70.147792]
  private defaultZoomLevel: number = 8;
  private defaultMaxZoom: number = 18
  private defaultMinZoom: number = 3
  @ViewChild("uploadFileModal") uploadFileModal?: ModalComponent
  @Input() prefix: string = '';
  @Input() featureCollectionInput?: GeoJsonResult;

  modalConfig: IModalConfig = {
    modalTitle: 'Importar Archivo/s',
    dashboardHeader: true,
  }

  modalOption: IModalOption = {
    centered: true,
    size: 'md',
  }

  private openUploadFileMapModal() {
    this.uploadFileModal?.open()
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: this.defaultMapLocation,
      zoom: this.defaultZoomLevel,
      zoomControl: false,
    });
  }

  private setFeatureGroup() {
    this.featureGroup = new L.FeatureGroup();
    this.map?.addLayer(this.featureGroup)
  }

  private switchBaseLayer(): void {
    /* All free BaseLayer available > https://leaflet-extras.github.io/leaflet-providers/preview/ */

    const baseLayers: IBaseLayer = {
      "Default": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      "Outdoor": L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'),
      "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'),
      "light": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'),
      "Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'),
    }

    if (this.map) {
      const baseLayerSwitcherController: L.Control = L.control.layers(baseLayers).addTo(this.map);
      const defaultBaseLayerProvider: string = localStorage.getItem('layerMapProvider') || "Default";
      const defaultBaseLayer = baseLayers[defaultBaseLayerProvider]
      if (defaultBaseLayer) {
        defaultBaseLayer.addTo(this.map);
      }
      this.map.on('baselayerchange', (event: any) => {
        localStorage.setItem('layerMapProvider', event.name)
      });
    }
  }

  private geomanControllers() {
    if (this.map) {
      this.map.attributionControl.setPrefix(this.prefix);

      L.control.zoom({
        position: "topright",
        zoomInTitle: 'Acercar',
        zoomOutTitle: 'Alejar'
      }).addTo(this.map);

      this.map.pm.addControls({
        position: 'topright',
        drawCircle: false,
        drawCircleMarker: false,
        drawText: false,
        drawMarker: false,
        cutPolygon: false,
        editControls: true,
      });

      this.map.pm.setLang('es');

      this.map.on('pm:create', (e: any) => {
        this.featureGroup?.addLayer(e.layer);
      });

      const newMarker: any = this.map.pm.Toolbar.copyDrawControl('drawMarker', { name: "newMarker" })
      newMarker.drawInstance.setOptions({ markerStyle: { icon: this.iconMarker("#00b8e6") } });
    }
  }

  private customToolbar() {
    const customToolbarActions: any = [
      {
        text: "Importar GeoJSON",
        onClick: () => {
          this.openUploadFileMapModal()
        },
      },
      {
        text: "Exportar GeoJSON",
        onClick: () => {
          this.exportGeoJson();
        },
      },
      "cancel",
    ];

    if (this.map) {
      this.map.pm.Toolbar.createCustomControl({
        name: "import",
        title: "Cargar GeoJSON",
        className: 'upload-map',
        actions: customToolbarActions
      });
    }
  }

  private iconMarker(color: string): L.DivIcon {
    const markerHtmlStyles = `
    background: ${color};
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    border: 1px solid #fff;
    position: absolute;
    transform: rotate(-45deg);
    left: 50%;
    top: 50%;
    margin: -15px 0 0 -15px;`;

    const icon = L.divIcon({
      className: "my-custom-pin",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
      html: `<span style="${markerHtmlStyles}"/>`
    });

    L.Marker.prototype.options.icon = icon;

    return icon;
  }

  private getFeatureCollectionFromFile() {
    this.fileManagerService.getFileFeatureCollection().subscribe((res: GeoJsonResult) => {
      this.renderFeatureCollectionToMap(res)
    })
  }

  private renderFeatureCollectionToMap(featureCollection: GeoJsonResult) {
    if (this.map) {
      L.geoJSON(featureCollection).addTo(this.map);
    }
  }


  /* mover esto a un servicio */
  exportGeoJson() {
    if (this.map) {
      const geomanLayers = this.map.pm.getGeomanLayers();

      const geojson: GeoJsonResult = {
        type: 'FeatureCollection',
        features: []
      };

      geomanLayers.forEach((layer: any) => {
        const layerGeoJSON = layer.toGeoJSON();
        geojson.features.push(layerGeoJSON);
      });

      console.log(geojson)

      /* if (this.map?.pm.getGeomanDrawLayers().length === 0) {
        this.toastService.showToast("error", "Error", "Se requiere dibujar algo en el mapa para poder exportar.");
        return;
      } */

      //const blob = new Blob([JSON.stringify(this.featureGroup?.toGeoJSON())], { type: 'application/json' });
      //saveAs(blob, 'mapa.geojson')
    }
  }

  drawInputFeatureCollectionIntoMap() {
    if(!this.featureCollectionInput) return;
    this.renderFeatureCollectionToMap(this.featureCollectionInput)
  }

  constructor(private fileManagerService: FileManagerService) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.setFeatureGroup();
    this.geomanControllers();
    this.customToolbar();
    this.switchBaseLayer();
    this.getFeatureCollectionFromFile();
    this.drawInputFeatureCollectionIntoMap();
  }

}
