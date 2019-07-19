import { default as map } from './map';



$("#layer").click(function () {
    if ($(this).hasClass("active"))
        return false;
    $(this).toggleClass('active');
    $("#people").toggleClass('active');
    $("#peopleTree").toggle();
    $("#layerTree").toggle();
    return false;
});
$("#people").click(function () {
    if ($(this).hasClass("active"))
        return false;
    $(this).toggleClass('active');
    $("#layer").toggleClass('active');
    $("#peopleTree").toggle();
    $("#layerTree").toggle();
    return false;
});
$(window).resize(function () {
    var isCollapse = $('body').hasClass('sidebar-collapse')//>767用它来判断
    var isOpen = $('body').hasClass('sidebar-open')//<767用它来 
    if ($(window).width() >= 767) {
        if (!isCollapse) {
            $('#mapCon').css({
                "position": "absolute",
                "height": "calc(100% - 51px)",
                "width": "calc(100% - 230px)"
            })
        } else {
            $('#mapCon').css({
                "position": "absolute",
                "height": "calc(100% - 51px)",
                "width": "100%"
            })
        }
    }
    else if ($(window).width() < 767) {
        if (isOpen) {
            $('#mapCon').css({
                "position": "absolute",
                "height": "calc(100% - 0px)",
                "width": "calc(100% - 230px)"
            })
        } else {
            $('#mapCon').css({
                "position": "absolute",
                "height": "calc(100% - 100px)",
                "width": "100%"
            })
        }

    }

    map.updateSize()
});
$(document).on('expanded.pushMenu', () => {
    if ($(window).width() >= 767) {
        $('#mapCon').css({
            "position": "absolute",
            "height": "calc(100% - 51px)",
            "width": "calc(100% - 230px)"
        })
    }
    else {
        $('#mapCon').css({
            "position": "absolute",
            "height": "calc(100% - 0px)",
            "width": "calc(100% - 230px)"
        })
    }

    map.updateSize()
})
$(document).on('collapsed.pushMenu', () => {
    if ($(window).width() >= 767) {
        $('#mapCon').css({
            "position": "absolute",
            "height": "calc(100% - 51px)",
            "width": "100%"
        })
    }
    else {
        $('#mapCon').css({
            "position": "absolute",
            "height": "calc(100% - 100px)",
            "width": "100%"
        })
    }
    map.updateSize()
})
$("#closeMapOp").click(function () {
    $("#mapOp").animate({
        width: 'toggle'
    }, 150);
    $("#closeMapOp").hide();
    $("#openMapOp").show();
});
$("#openMapOp").click(function () {
    $("#mapOp").animate({
        width: 'toggle'
    }, 150);
    $("#openMapOp").hide();
    $("#closeMapOp").show();
});

$("#unlogin").click(function () {
    setCookie("username", "",-1);
    window.location.href = "login.html";
})
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length);
    }
    return "";
}
//登录控制
// if (getCookie("username") == "") {
//     window.location.href = "login.html";
// }
//获得用户列表
$.ajax({
    type: "get",
    url: 'https://api2.bmob.cn/1/classes/_User',
    headers: {
        "X-Bmob-Application-Id": "ae69ae4ad1b9328f1993c62a637454a7",
        "X-Bmob-REST-API-Key": "05d377b293e63f9f9e22788154af1449"
    },
    dataType: "json",
    complete: function (jqXHR, textStatus) {
        var data = jqXHR.responseJSON.results;

        if (jqXHR.status == 200) {
            var str = '';
            for (var i = 0; i < data.length; i++) {
                str += "<tr>";
                str += "<td>" + (i + 1) + "</td>";
                str += "<td>" + data[i].username + "</td>";
                str += "</tr>";

            }
            $("#user tbody").empty();
            $("#user tbody").append(str);
        } else {
            console.log('获取用户表' + jqXHR.responseJSON);
        }
    }
});