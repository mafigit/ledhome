$(function() {
  var red_slider = document.querySelector('.red_slider');
  var green_slider = document.querySelector('.green_slider');
  var blue_slider = document.querySelector('.blue_slider');
  var color_field = document.querySelector('.current_color')

  red_slider.value = 0;
  green_slider.value = 0;
  blue_slider.value = 0;

  var setColor = function(id, color, ip) {
    var ajax = false;
    var current_val = 0;
    var current_val_old = 0;
    return  function() {
      console.log(id);
      console.log(ip);
      red_slider_value = parseInt(red_slider.value);
      green_slider_value = parseInt(green_slider.value);
      blue_slider_value = parseInt(blue_slider.value);

      switch(color) {
        case 'red':
          current_val = red_slider_value;
          break;
        case 'green':
          current_val = green_slider_value;
          break;
        case 'blue':
          current_val = blue_slider_value;
          break;
      }

      if(!ajax && current_val_old != current_val) {
        ajax = true;
        $.get('/setled', {ip: ip, id: id, color: color, value: current_val}, function(data) {
          ajax = false;
          current_val_old = current_val;
        });
        var rgbvalue = rgbToHex(red_slider_value, green_slider_value,
          blue_slider_value);
        color_field.style.backgroundColor=rgbvalue;
      }

    }
  }

  var Controller = function(id, ip) {
    this.id = id;
    this.ip = ip;
    this.set_red_color = setColor(id, 'red', ip);
    this.set_green_color = setColor(id, 'green', ip);
    this.set_blue_color = setColor(id, 'blue', ip);
  }

  Controller.prototype.addControls = function(red, green, blue)  {
    var _self = this;
    console.log(this);
    var init_red = new Powerange(red_slider, {
      start: red,
      min: 0,
      max: 255,
      callback: function() {
        _self.set_red_color();
      },
      klass: "red_powerrange"
    });

    var init_green = new Powerange(green_slider, {
      start: green,
      min: 0,
      max: 255,
      callback: function() {
        _self.set_green_color();
      },
      klass: "green_powerrange"
    });

    var init_blue = new Powerange(blue_slider, {
      start: blue,
      min: 0,
      max: 255,
      callback: function() {
        _self.set_blue_color();
      },
      klass: "blue_powerrange"
    });
  }

  $("#add_ledstripe").click(function() {
    var form_data = $("#ledstripe_form").serializeArray();
    $.post("/api/ledstripes",
      { name: form_data[0].value, ip: form_data[1].value}, function(data) {
      console.log(data);
    })
  });

  var current_leds = {};

  var ledstipe_html =
    "<div class=ledstripe data-id={{id}} data-ip={{ip}} data-name={{name}} data-red={{red}}" +
      " data-green={{green}} data-blue={{blue}}>" +
      "<label>{{name}}</label>" +
      "<button class='delete-led pure-button'>delete</button>" +
      "<button class='select-led pure-button'>select</button>" +
    "</div>"
  $.get("/api/ledstripes", function(data) {
    data.forEach(function(el) {
      var ledstripe_view = {
        id: el._id,
        name: el.name,
        ip: el.ip,
        red: el.red,
        green: el.green,
        blue: el.blue
      }
      $("#leds_field h2").after(Mustache.render(ledstipe_html, ledstripe_view));
      current_leds[el._id] = new Controller(el._id, el.ip);
      current_leds[el._id].addControls(el.red, el.green, el.blue);
    });
  });

  $('body').delegate('.delete-led','click', function(e) {
    var led_id = $(e.target).parent().attr('data-id');
    $.ajax({
        url: '/api/ledstripes/' + led_id,
        type: 'DELETE',
        success: function(result) {
          console.log(result)
        }
    })
    $(e.target).parent().remove();
  });

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

});
