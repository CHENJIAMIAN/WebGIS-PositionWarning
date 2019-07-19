import { default as map } from './map';
import { styleBlue, styleRed, isInPoly, renderWarning } from './peopleDemo';
import { Group, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { fromLonLat, transform, get as getProjection } from 'ol/proj.js';
import Feature from 'ol/Feature';
import { Vector as VectorSource } from 'ol/source.js';
import { Point } from 'ol/geom';
import { booleanPointInPolygon, point, polygon } from '@turf/turf'
import { default as basetree } from './basetree';
import {showLayer} from './showlayer'


//添加手机人员图层
var PHONE_PEO_TREENODE_ID = 4
export var vectorPhonePeo = new VectorLayer({
    title: '手机人员',
    treeNdoeId: PHONE_PEO_TREENODE_ID,
    zIndex: 1,
    source: new VectorSource()
});
map.addLayer(vectorPhonePeo);
//2s 更新一次最新位置到地图
var updatePositionInterval = setInterval(() => {
    fetch('https://api2.bmob.cn/1/classes/position', {
        headers: {
            'X-Bmob-Application-Id': 'ae69ae4ad1b9328f1993c62a637454a7',
            'X-Bmob-REST-API-Key': '05d377b293e63f9f9e22788154af1449',
        },
        method: 'GET',
    }).then(response => response.json()).then(function (result) {
        if (result == undefined)
            return;
        if (result.code == 10210) {
            clearInterval(updatePositionInterval);
            confirm(result.error); return;
        }
        //获得所有的人员名词
        var vectorPhonePeoNames = [];
        vectorPhonePeo.getSource().getFeatures().forEach((elem) => {
            vectorPhonePeoNames = vectorPhonePeoNames.concat(elem.getGeometryName())
        }
        );
        for (var i = 0; i < result.results.length; i++) {
            //如果不存在改人员名词，就添加人员要素
            if (!vectorPhonePeoNames.includes(result.results[i].name) || vectorPhonePeoNames.length == 0) {
                var pointGeom = new Point(fromLonLat([result.results[i].lon, result.results[i].lat]));
                var pointFeatPhonePeo = new Feature();
                pointFeatPhonePeo.setGeometryName(result.results[i].name);
                pointFeatPhonePeo.setGeometry(pointGeom)
                pointFeatPhonePeo.setStyle(styleBlue)
                //给人员要素添加zTree\layer要的属性
                pointFeatPhonePeo.values_.treeNdoeId = PHONE_PEO_TREENODE_ID++;
                pointFeatPhonePeo.values_.title = result.results[i].name
                //添加所有手机人员到人员列表
                basetree.peopleList = basetree.peopleList.concat(pointFeatPhonePeo);
                showLayer();

                vectorPhonePeo.getSource().addFeature(pointFeatPhonePeo);
            }
            //如果存在，就更新位置
            else {
                vectorPhonePeo.getSource().getFeatures().forEach((elem) => {
                    if (elem.getGeometryName() == result.results[i].name) {
                        elem.getGeometry().setCoordinates(fromLonLat([result.results[i].lon, result.results[i].lat]));
                    }
                }
                )
            }

        }

    })
}
    , 2000);
//1s 判断一次，手机人员是否安全，并上传IsSafe到Bmob云数据库
var isSafeInterval = setInterval(() => {
    vectorPhonePeo.getSource().getFeatures().forEach((elem) => {
        var pt = point(elem.getGeometry().getFlatCoordinates());
        var isSafe = isInPoly(pt);

        renderWarning(vectorPhonePeo, elem, isSafe);
        var isSafenum = 0;
        if (isSafe) {
            isSafenum = 1;
            $('#' + elem.getGeometryName()).css('background', '')
            $('#alertLightOff').show();
            $('#alertLightOn').hide();

        } else {
            isSafenum = 0;
            $('#' + elem.getGeometryName()).css('background', 'red')
            $('#alertLightOn').show();
            $('#alertLightOff').hide();
        }
        //上传IsSafe到Bmob云数据库
        fetch('https://api2.bmob.cn/1/classes/IsSafe?where={"name":"' + elem.getGeometryName() + '"}', {
            headers: {
                'Content-Type': 'application/json',
                'X-Bmob-Application-Id': 'ae69ae4ad1b9328f1993c62a637454a7',
                'X-Bmob-REST-API-Key': '05d377b293e63f9f9e22788154af1449',
            },
            method: 'PUT',
            body: '{"isSafe":' + isSafenum + '}',
        })
    }
    );

}
    , 1000)
