import Map from 'ol/Map.js';
import { unByKey } from 'ol/Observable.js';
import Overlay from 'ol/Overlay.js';
import { getArea, getLength } from 'ol/sphere.js';
import View from 'ol/View.js';
import { LineString, Polygon } from 'ol/geom.js';
import Draw from 'ol/interaction/Draw.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import map from "./map"

$("#clear").click(function () {
  clearMeasure();
});
$("#measureLine").click(function () {
  startMeasure(drawLineControl)
});
$("#measureArea").click(function () {
  startMeasure(drawAreaControl)
});
var measureSourceLay = new VectorSource();
var measureLay = new VectorLayer({
  source: measureSourceLay,
});
var drawLineControl = new Draw({
  source: measureSourceLay,
  type: ('LineString'),
});
var drawAreaControl = new Draw({
  source: measureSourceLay,
  type: /** @type {GeometryType} */            ('Polygon'),
});

var sketch, helpTooltipElement, helpTooltipOverLay, measureTooltipElement, measureTooltipOverLay;

function clearMeasure() {
  measureSourceLay.clear();
  map.removeLayer(measureLay);
  map.getOverlays().clear();
  map.removeInteraction(drawLineControl);
  map.removeInteraction(drawAreaControl);
}
function startMeasure(drawControl) {
  clearMeasure();
  map.addInteraction(drawControl);
  map.addLayer(measureLay);

  createMeasureTooltip();
  //创建测量工具提示框
  createHelpTooltip();
  //创建帮助提示框

  map.on('pointermove', pointerMoveHandler);
  //地图容器绑定鼠标移动事件，动态显示帮助提示框内容
  //地图绑定鼠标移出事件，鼠标移出时为帮助提示框设置隐藏样式
  $(map.getViewport()).on('mouseout', function () {
    $(helpTooltipElement).addClass('hidden');
  });

  var listener;
  //绑定交互绘制工具开始绘制的事件
  drawControl.on('drawstart', function (evt) {
    sketch = evt.feature;
    //绘制的要素
    var tooltipCoord = evt.coordinate;
    // 绘制的坐标
    //绑定change事件，根据绘制几何类型得到测量长度值或面积值，并将其设置到测量工具提示框中显示
    listener = sketch.getGeometry().on('change', function (evt) {
      var geom = evt.target;
      //绘制几何要素
      var output;
      if (geom instanceof Polygon) {
        output = formatArea(/** @type {Polygon} */
          (geom));
        //面积值
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
        //坐标
      } else if (geom instanceof LineString) {
        output = formatLength(/** @type {LineString} */
          (geom));
        //长度值
        tooltipCoord = geom.getLastCoordinate();
        //坐标
      }
      measureTooltipElement.innerHTML = output;
      //将测量值设置到测量工具提示框中显示
      measureTooltipOverLay.setPosition(tooltipCoord);
      //设置测量工具提示框的显示位置
    });
  }, this);
  //绑定交互绘制工具结束绘制的事件
  drawControl.on('drawend', function (evt) {
    measureTooltipElement.className = 'tooltip tooltip-static';
    //设置测量提示框的样式
    measureTooltipOverLay.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    //置空当前绘制的要素对象
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    //置空测量工具提示框对象
    createMeasureTooltip();
    //重新创建一个测试工具提示框显示结果
    unByKey(listener);
  }, this);
}
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltip hidden';
  helpTooltipOverLay = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(helpTooltipOverLay);
}
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltip tooltip-measure';
  measureTooltipOverLay = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltipOverLay);
}
var formatLength = function (line) {
  var length = Math.round(line.getLength() * 100) / 100;
  //直接得到线的长度
  var output;
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
    //换算成KM单位
  } else {
    output = (Math.round(length * 100) / 100) + ' ' + 'm';
    //m为单位
  }
  return output;
  //返回线的长度
};
var formatArea = function (polygon) {
  var area = polygon.getArea();
  //直接获取多边形的面积
  var output;
  if (area > 10000) {
    output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
    //换算成KM单位
  } else {
    output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
    //m为单位
  }
  return output;
  //返回多边形的面积
};
var pointerMoveHandler = function (evt) {
  if (evt.dragging) {
    return;
  }
  /** @type {string} */
  var helpMsg = '点击开始绘图';
  //当前默认提示信息
  var continuePolygonMsg = '点击继续绘制多边形';
  var continueLineMsg = '点击继续画线';
  //判断绘制几何类型设置相应的帮助提示信息
  if (sketch) {
    var geom = (sketch.getGeometry());
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg;
      //绘制多边形时提示相应内容
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg;
      //绘制线时提示相应内容
    }
  }
  helpTooltipElement.innerHTML = helpMsg;
  //将提示信息设置到对话框中显示
  helpTooltipOverLay.setPosition(evt.coordinate);
  //设置帮助提示框的位置
  $(helpTooltipElement).removeClass('hidden');
  //移除帮助提示框的隐藏样式进行显示
};