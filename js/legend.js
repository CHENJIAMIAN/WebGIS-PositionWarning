import { default as Legend } from 'ol-ext/control/Legend'
import { Style, RegularShape, Stroke, Fill } from 'ol/style'
import { default as map, safeArea } from './map'
import Feature from 'ol/Feature';
import {Point} from'ol/geom'


// Define a new legend
var legend = new Legend({
    title: '图例',
    style: new Style({
        image: new RegularShape({
          radius: 15,
          points: 4,
          rotation:2.36,
          stroke: new Stroke({ color: [0, 153, 255, 1], width: 1 }),
          fill: new Fill({ color: [255, 255, 255, .3], width: 1 })
        })
      }),
    collapsed: false
});

map.addControl(legend);
var f0 = new Feature(new Point([269914, 6248592]));
legend.addRow({
    title: '安全区图层',
    feature: f0
});

$(window).on("load", function () { legend.refresh(); });