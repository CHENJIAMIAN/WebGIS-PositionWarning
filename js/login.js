import "./import-jquery"

//交互动画
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

$(window, document, undefined).ready(function () {

  $('input').blur(function () {
    var $this = $(this);
    if ($this.val())
      $this.addClass('used');
    else
      $this.removeClass('used');
  });

  var $ripples = $('.ripples');

  $ripples.on('click.Ripples', function (e) {

    var $this = $(this);
    var $offset = $this.parent().offset();
    var $circle = $this.find('.ripplesCircle');

    var x = e.pageX - $offset.left;
    var y = e.pageY - $offset.top;

    $circle.css({
      top: y + 'px',
      left: x + 'px'
    });

    $this.addClass('is-active');

  });

  $ripples.on('animationend webkitAnimationEnd mozAnimationEnd oanimationend MSAnimationEnd', function (e) {
    $(this).removeClass('is-active');
  });

});

$(function () {
  $('#login').click(() => {
    $.ajax({
      type: "get",
      url: 'https://api2.bmob.cn/1/classes/_User/?where={"username":"' + $("#username").val() + '","password":"' + $("#password").val() + '"}',
      headers: {
        "X-Bmob-Application-Id": "ae69ae4ad1b9328f1993c62a637454a7",
        "X-Bmob-REST-API-Key": "05d377b293e63f9f9e22788154af1449"
      },
      dataType: "json",
      complete: function (jqXHR, textStatus) {
        if (jqXHR.status == 200) {
          if (jqXHR.responseJSON.results.length > 0) {
            setCookie("username", $("#username").val() ,1);
            location.href = "index.html";
          }else{
            alert("用户名或密码错误")
          }
        } else if (jqXHR.status == 400) {
          alert("出错了400 "+qXHR.responseJSON);
        }
      }
    });
  }
  )
  $('#regist').click(() => {
    $.ajax({
      type: "post",
      url: "https://api2.bmob.cn/1/classes/_User",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-Bmob-Application-Id": "ae69ae4ad1b9328f1993c62a637454a7",
        "X-Bmob-REST-API-Key": "05d377b293e63f9f9e22788154af1449"
      },
      data: '{"username":"' + $("#username").val() + '","password":"' + $("#password").val() + '"}'
      ,
      dataType: "json",
      complete: function (jqXHR, textStatus) {
        if (jqXHR.status == 201) {
          alert("注册成功")
        } else if (jqXHR.status == 400) {
          alert("用户已存在！");
        }
      }
    });
  }
  );

});