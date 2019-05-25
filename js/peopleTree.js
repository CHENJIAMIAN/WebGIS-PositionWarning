import { default as map } from './map';
import { vectorPhonePeo } from './phonePeople';
import { default as basetree } from './basetree';
import { vector, vector2, vector3 } from './peopleDemo';


window.map = map;
//初始化人员树,绑定选中事件
var setting = {
    check: {
        enable: true
    },

    view: {
        selectedMulti: false
    },
    edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
    },
    data: {
        keep: {
            parent: true,
            leaf: true
        },
        simpleData: {
            enable: true
        }
    },
    callback: {
        onCheck: onCheck,
        onRightClick: showMenu
    }
};
var zNodes = [];
$.fn.zTree.init($("#peopleTree"), setting, zNodes);
export var zTree = $.fn.zTree.getZTreeObj("peopleTree");
//人员列表
window.basetree = basetree;
basetree.peopleList = [vector, vector2, vector3];
//添加人员根节点
zTree.addNodes(null, {
    id: 0,
    isParent: true,
    name: "人员组",
    checked: true
});
//添加人员根节点
basetree.peopleList.forEach(function (vector) {
    zTree.addNodes(zTree.getNodeByParam("id", 0, null), {
        //在根节点下添加人员子节点
        id: 10 + vector.values_.treeNdoeId.toString(),
        vectorId: vector.values_.treeNdoeId,
        //id为 10x
        pId: 0,
        isParent: false,
        name: vector.values_.title,
        //名字为tag
        checked: true
    });
})
//选中事件
function onCheck(e, treeId, treeNode) {
    var layersArray = map.getLayers().getArray();
    if (treeNode.checked) {
        //选中
        if (treeNode.name == '人员组') {
            for (var i = 1; i < layersArray.length; i++) {
                layersArray[i].setVisible(true)
            }
        } else {
            //根据节点名(数字)作为索引,来获取图层
            layersArray[treeNode.vectorId].setVisible(true)
        }
    } else {
        if (treeNode.name == '人员组') {
            for (var i = 1; i < layersArray.length; i++) {
                layersArray[i].setVisible(false)
            }
        } else {
            layersArray[treeNode.vectorId].setVisible(false)
        }
    }
}
// 显示右键菜单
function showMenu(event, treeId, treeNode) {
    var type = '';
    var x = event.clientX;
    var y = event.clientY;

    if (!treeNode) {
        type = 'root';
        zTree.cancelSelectedNode();
    } else if (treeNode && !treeNode.noR) {
        // noR 属性为 true 表示禁止右键菜单
        zTree.selectNode(treeNode);
    }

    // 不同节点显示的菜单可能不一样
    if ('root' === type)
        return;

    $('#menu-item-delete').show();
    $('#menu-item-rename').show();

    $('#directory-tree-menu').css({
        left: x + 'px',
        top: y + 'px'
    }).show();
}
$(document).on('mousedown', function (event) {
    if (!(event.target.id == 'directory-tree-menu' || $(event.target).parents('#directory-tree-menu').length > 0)) {
        hideMenu();
    }
});
//隐藏右键菜单
function hideMenu() {
    $('#directory-tree-menu').hide();
    $(document).off('mousedown');
}

var openedLayerIndex = 0;
export var showLayer = function () {
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
showLayer();

