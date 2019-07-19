import { GeometryType, Polygon, LineString, MultiPolygon, Point } from 'ol/geom';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay';
import { unByKey } from 'ol/Observable.js';
import { shiftKeyOnly, always, click, pointerMove, altKeyOnly, singleClick } from 'ol/events/condition';
import { GeoJSON, WFS } from 'ol/format';
import { Select, Draw, Modify, DragZoom, defaults as defaultInteractions } from 'ol/interaction.js';
import { Group, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import View from 'ol/View.js';
import { getWidth, getCenter } from 'ol/extent.js';
import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import { fromLonLat, transform, get as getProjection } from 'ol/proj.js';
import { register } from 'ol/proj/proj4.js';
import { OSM, TileImage, TileWMS, XYZ, Vector as VectorSource } from 'ol/source.js';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS.js';
import TileGrid from 'ol/tilegrid/TileGrid.js';
import { Circle, Fill, Stroke, Style, Icon } from 'ol/style.js';
import Feature from 'ol/Feature';
import { FullScreen, OverviewMap } from 'ol/control.js';
import { defaults as defaultControls, Control } from 'ol/control';
import { queryWfs, modifyWfs, addWfs, deleteWfs } from "./WFS"

import { default as FontSymbol } from 'ol-ext/style/FontSymbol'
import { default as Shadow } from 'ol-ext/style/Shadow'

//图层控制----------------------------------------------------------------------------------------------------
parent.TiandituKey = "1868c5b20d2370d44dd9a2d00933ee60";
export var TiandiMap_vec = new TileLayer({
    title: '天地图矢量图层',
    source: new XYZ({
        url: "http://t0.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=" + parent.TiandituKey,
        //parent.TiandituKey为天地图密钥
    })
});
window.vvv = TiandiMap_vec;
export var TiandiMap_img = new TileLayer({
    title: '天地图影像图层',
    source: new XYZ({
        url: "http://t0.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=" + parent.TiandituKey,
        //parent.TiandituKey为天地图密钥
    })
});
export var TiandiMap_cva = new TileLayer({
    title: "天地图矢量注记图层",
    source: new XYZ({
        url: "http://t0.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=" + parent.TiandituKey,
        //parent.TiandituKey为天地图密钥
    })
});
export var TiandiMap_cia = new TileLayer({
    title: '天地图影像注记图层',
    source: new XYZ({
        url: "http://t0.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=" + parent.TiandituKey,
        //parent.TiandituKey为天地图密钥
    })
});
export var safeArea = new VectorLayer({
    title: '安全区',
    source: new VectorSource({
        url: 'http://47.106.64.137:8080/geoserver/myWorkSpace/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=myWorkSpace%3AsafeArea_Origin&maxFeatures=50&outputFormat=application%2Fjson',
        format: new GeoJSON(),
        crossOrigin: "Anonymous"

    }),
});
export var Railway = new TileLayer({
    title: '铁路',
    source: new TileWMS({
        projection: 'EPSG:3857',
        url: 'http://47.106.64.137:8080/geoserver/myWorkSpace/wms',
        params: {
            'FORMAT': "image/png",
            'VERSION': '1.1.1',
            tiled: true,
            "LAYERS": 'myWorkSpace:Railway',
            "exceptions": 'application/vnd.ogc.se_inimage',
            tilesOrigin: 116.19182584430769 + "," + 39.81643238561958
        }
    })
});
export var layersToMap = new Group({
    title: '图层组',
    layers: [TiandiMap_img, TiandiMap_vec, TiandiMap_cva, Railway, safeArea,]
});
var map = new Map({
    //地图容器div的ID
    target: 'mapCon',
    //地图容器中加载的图层
    layers: [layersToMap],
    //地图视图设置
    view: new View({
        center: fromLonLat([112.91940620072556, 27.907336633266738]),
        //科大坐标 112.91940620072556,27.907336633266738  //北京铁路坐标：116.21582584430769, 39.84043238561958
        zoom: 17

    }),
    controls: defaultControls().extend([new OverviewMap({ collapsed: false }), new FullScreen()])
});
var dragZoomOut = new DragZoom({
    condition: always,
    out: false,
    // 此处为设置拉框完成时放大还是缩小，当out为true时，为缩小，当out为false时，为放大
})
var dragZoomIn = new DragZoom({
    condition: always,
    out: true,
});
var selectInteraction = new Select({
    condition: pointerMove,
    // 关键： 设置过了条件，可以用feature来写过滤，也可以用layer来写过滤
    filter: function (feature, layer) {
        if (layer == null) return false;
        if (layer.get("title") == "手机人员") {
            // console.log(feature.getGeometryName())
        }
        return layer === safeArea;
    }
});
map.addInteraction(selectInteraction)
var modifyInteraction = new Modify({
    deleteCondition: function (event) {
        return shiftKeyOnly(event) && singleClick(event);
    },
    features: selectInteraction.getFeatures()
});
modifyInteraction.on('modifyend', function (e) {
    // 把修改完成的feature暂存起来
    var modifiedFeatures = e.features;
    saveModify(modifiedFeatures);
});



//WFS Modify Draw----------------------------------------------------------------------------------------------------
function saveModify(modifiedFeatures) {
    if (modifiedFeatures && modifiedFeatures.getLength() > 0) {
        // 转换坐标
        var modifiedFeature = modifiedFeatures.item(0).clone();
        // 注意ID是必须，通过ID才能找到对应修改的feature
        modifiedFeature.setId(modifiedFeatures.item(0).getId());
        // 调换经纬度坐标，以符合wfs协议中经纬度的位置
        modifiedFeature.getGeometry().applyTransform(function (flatCoordinates, flatCoordinates2, stride) {
            for (var j = 0; j < flatCoordinates.length; j += stride) {
                var y = flatCoordinates[j];
                var x = flatCoordinates[j + 1];
                flatCoordinates[j] = x;
                flatCoordinates[j + 1] = y;
            }
            for (var j = 0; j < flatCoordinates.length; j += stride) {
                var xy = transform([flatCoordinates[j + 1], flatCoordinates[j]], 'EPSG:3857', 'EPSG:4326');
                flatCoordinates[j + 1] = xy[0];
                flatCoordinates[j] = xy[1];
            }

        });
        modifyWfs([modifiedFeature]);
    }
}
function saveDraw(drawedFeature) {
    if (drawedFeature) {
        var geometry = drawedFeature.getGeometry().clone();
        geometry.applyTransform(function (flatCoordinates, flatCoordinates2, stride) {
            for (var j = 0; j < flatCoordinates.length; j += stride) {
                var y = flatCoordinates[j];
                var x = flatCoordinates[j + 1];
                flatCoordinates[j] = x;
                flatCoordinates[j + 1] = y;
            }
        });
        // 设置feature对应的属性，这些属性是根据数据源的字段来设置的
        var newFeature = new Feature();
        newFeature.setGeometry(new MultiPolygon([geometry.getCoordinates()]));
        newFeature.getGeometry().applyTransform(function (flatCoordinates, flatCoordinates2, stride) {
            for (var j = 0; j < flatCoordinates.length; j += stride) {
                var y = flatCoordinates[j];
                var x = flatCoordinates[j + 1];
                flatCoordinates[j] = x;
                flatCoordinates[j + 1] = y;
            }
            for (var j = 0; j < flatCoordinates.length; j += stride) {
                var xy = transform([flatCoordinates[j], flatCoordinates[j + 1]], 'EPSG:3857', 'EPSG:4326');
                flatCoordinates[j] = xy[0];
                flatCoordinates[j + 1] = xy[1];
            }

        });
        newFeature.setProperties({
            'Id': 0
        })
        addWfs([newFeature]);

        // 3秒后，自动刷新页面上的feature
        setTimeout(function () {
            drawLayer.getSource().clear();
            queryWfs();
        }, 1000);
        drawedFeature = null;
    }
}
var drawLayer = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        stroke: new Stroke({
            color: 'blue',
            width: 5
        })
    })
});
var drawInteraction = new Draw({
    type: 'Polygon',
    source: drawLayer.getSource()
});
drawInteraction.on('drawend', function (e) {
    // 绘制结束时暂存绘制的feature
    var drawedFeature = e.feature;
    saveDraw(drawedFeature);
});



//地图基础操作----------------------------------------------------------------------------------------------------
$(function () {
    $("#zoomOut").click(function () {
        dragZoomOut.setActive(true);
        map.addInteraction(dragZoomOut);
        document.querySelector("#mapCon").style.cursor = "crosshair";
    });
    $("#zoomIn").click(function () {
        dragZoomIn.setActive(true);
        map.addInteraction(dragZoomIn);
        document.querySelector("#mapCon").style.cursor = "crosshair";

    });
    $("#pan").click(function () {
        dragZoomIn.setActive(false);
        dragZoomOut.setActive(false);

        document.querySelector("#mapCon").style.cursor = "default";

    });
    $("#fullExtent").click(function () {
        map.getView().setCenter(fromLonLat([116.21582584430769, 39.84043238561958]));
        map.getView().setZoom(14);
    });

    //============================================================================================
    //开始编辑
    $('#StartEdit').click(() => {
        map.removeInteraction(modifyInteraction)
        map.removeInteraction(drawInteraction);

        map.addInteraction(modifyInteraction)
    }
    )
    $('#addSafeArea').click(() => {
        map.removeInteraction(drawInteraction);
        map.removeInteraction(modifyInteraction)

        map.addInteraction(drawInteraction);
    }
    )
    $('#cancelEdit').click(() => {
        map.removeInteraction(modifyInteraction)
        map.removeInteraction(drawInteraction);
    }
    )
    //按下delete键删除要素
    $(document).keydown(function (event) {
        if (event.keyCode == 46) {
            // 删选择器选中的feature
            if (selectInteraction.getFeatures().getLength() > 0) {
                deleteWfs([selectInteraction.getFeatures().item(0)]);
                // 3秒后自动更新features
                setTimeout(function () {
                    selectInteraction.getFeatures().clear();
                    queryWfs();
                }, 1000);
            }
        }
    });
});


export default map;