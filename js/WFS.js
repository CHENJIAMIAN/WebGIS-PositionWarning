import {
    default as map
    , TiandiMap_img, TiandiMap_vec, TiandiMap_cva, Railway,layersToMap
} from "./map"
import { Group, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';
import {
    equalTo as equalToFilter,
    like as likeFilter,
    and as andFilter
} from 'ol/format/filter.js';
import { WFS, GeoJSON } from 'ol/format.js';
import VectorSource from 'ol/source/Vector.js';
import { Stroke, Style } from 'ol/style.js';

//WFS
//查询安全区图层
var wfsFeatureType = 'safeArea_Origin';
export function queryWfs() {
    map.removeLayer(layersToMap)
    var safeArea = new VectorLayer({
        title: '安全区',
        source: new VectorSource({
            url: 'http://localhost:8080/geoserver/myWorkSpace/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=myWorkSpace%3AsafeArea_Origin&maxFeatures=50&outputFormat=application%2Fjson',
            format: new GeoJSON()
        })
    });
    var layersToMap2 = new Group({
        title: '图层组',
        layers: [TiandiMap_img, TiandiMap_vec, TiandiMap_cva, Railway, safeArea,]
    });
    map.addLayer(layersToMap2)
}

// 把修改提交到服务器端
export function modifyWfs(features) {
    var WFSTSerializer = new WFS();
    var featObject = WFSTSerializer.writeTransaction(null, features, null, {
        featureType: wfsFeatureType,
        featureNS: 'myWorkSpaceURI',
    });
    // 转换为xml内容发送到服务器端
    var featString = new XMLSerializer().serializeToString(featObject);
    var featString2 = featString.replace('geometry', 'the_geom');
    var request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:8080/geoserver/wfs?service=wfs');
    // 指定内容为xml类型
    request.setRequestHeader('Content-Type', 'text/xml');
    request.send(featString2);
}
// 添加到服务器端
export function addWfs(features) {
    var WFSTSerializer = new WFS();
    var featObject = WFSTSerializer.writeTransaction(features, null, null, {
        featureType: wfsFeatureType,
        featureNS: 'myWorkSpaceURI',
    });
    var serializer = new XMLSerializer();
    var featString = serializer.serializeToString(featObject);
    var featString2 = featString.replace('geometry', 'the_geom').replace('geometry', 'the_geom');
    var request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:8080/geoserver/wfs?service=wfs');
    request.setRequestHeader('Content-Type', 'text/xml');
    request.send(featString2);
}
// 在服务器端删除feature
export function deleteWfs(features) {
    var WFSTSerializer = new WFS();
    var featObject = WFSTSerializer.writeTransaction(null, null, features, {
        featureType: wfsFeatureType,
        featureNS: 'myWorkSpaceURI'
    });
    var serializer = new XMLSerializer();
    var featString = serializer.serializeToString(featObject);
    var request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:8080/geoserver/wfs?service=wfs');
    request.setRequestHeader('Content-Type', 'text/xml');
    request.send(featString);
}