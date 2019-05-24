var lineLayerSource, lineLayer, drawLineInteraction;
//添加人员路径
$('#addLayer').click(() => {
    map.removeInteraction(drawLineInteraction);
    map.removeLayer(lineLayer)

    // 添加一个绘制的线使用的layer
    lineLayerSource = new VectorSource()
    lineLayer = new VectorLayer({
        source: lineLayerSource,
        style: new Style({
            stroke: new Stroke({
                color: 'red',
                size: 1
            })
        })
    })
    map.addLayer(lineLayer);
    drawLineInteraction = new Draw({
        type: 'LineString',
        source: lineLayer.getSource()// 注意设置source，这样绘制好的线，就会添加到这个source里
    });
    map.addInteraction(drawLineInteraction);

}
)
$('#undoAdded').click(() => {
    //移除第一个lineLayerSource.removeFeature(lineLayerFeatures[0])
    if (lineLayerSource != undefined) {
        var lineLayerFeatures = lineLayerSource.getFeatures();
        if (lineLayerFeatures.length > 0) {
            // 移除最后一个
            lineLayerSource.removeFeature(lineLayerFeatures[lineLayerFeatures.length - 1])
        }
    }

}
)
$('#cancelAdd').click(() => {
    map.removeInteraction(drawLineInteraction);
    map.removeLayer(lineLayer)
}
)