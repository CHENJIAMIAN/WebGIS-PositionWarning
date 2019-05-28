

//显示预警窗口
var openedLayerIndex = 0;
export function showLayer() {
    //弹窗报警,动态根据人名生成弹出内容
    basetree.layerContent = '<ul class="list-group">'
    basetree.peopleList.forEach(function (vector) {
        var peopleName = vector.values_.title
        var li = '<li class="list-group-item"  id="' + peopleName + '">' + peopleName + '</li>  '
        basetree.layerContent += li;
    })
    basetree.layerContent += ' </ul >'
    //弹窗报警
    layer.close(openedLayerIndex)
    openedLayerIndex = layer.open({
        type: 1,
        title: "预警窗口",
        //不显示标题
        skin: 'layui-layer-demo',
        //样式类名
        anim: 2,
        closeBtn: 0,
        shade: false,
        //宽度\高度
        area: ['200px', '350px'],
        offset: ['300px', '10px'],
        //宽高
        content: basetree.layerContent
    });
};