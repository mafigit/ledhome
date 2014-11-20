window.LedHome = window.LedHome || {};
var current_leds = {};
var red_slider = document.querySelector('.red_slider');
var green_slider = document.querySelector('.green_slider');
var blue_slider = document.querySelector('.blue_slider');
var color_field = document.querySelector('.current_color')
var socket = io.connect('http://192.168.1.104:8080');

socket.on('ledstripe', function(data) {
  current_leds[data.id].setControls(data.r, data.g, data.b)
})

red_slider.value = 0;
green_slider.value = 0;
blue_slider.value = 0;

var setColor = function(id, color, ip) {
  var ajax = false;
  var current_val = 0;
  var current_val_old = 0;
  return  function(object) {
    var red_slider_value = getColorValues().r;
    var green_slider_value = getColorValues().g;
    var blue_slider_value = getColorValues().b;
    object.red = red_slider_value;
    object.green = green_slider_value;
    object.blue = blue_slider_value;

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
      setColorField(red_slider_value, green_slider_value, blue_slider_value);
      socket.emit('ledstripe', { id: id, r: red_slider_value,
        g: green_slider_value, b: blue_slider_value })
    }

  }
}

var getColorValues = function() {
  var color_hash =
    { r: parseInt(red_slider.value),
      g: parseInt(green_slider.value),
      b: parseInt(blue_slider.value)
    };
  return color_hash;
}
var setColorField = function(r, g, b) {
  var rgbvalue = LedHome.Util.rgbToHex(r, g, b);
  color_field.style.backgroundColor=rgbvalue;
}

var Controller = function(id, ip) {
  this.id = id;
  this.ip = ip;
  this.red = 0;
  this.green = 0;
  this.blue = 0;
  this.set_red_color = setColor(id, 'red', ip);
  this.set_green_color = setColor(id, 'green', ip);
  this.set_blue_color = setColor(id, 'blue', ip);
}

Controller.prototype.addControls = function(red, green, blue, id)  {
  var _self = this;
  _self.init_red = new Powerange(red_slider, {
    start: red,
    min: 0,
    max: 255,
    callback: function() {
      _self.set_red_color(_self);
    },
    klass: "red_powerrange"
  });

  _self.init_green = new Powerange(green_slider, {
    start: green,
    min: 0,
    max: 255,
    callback: function() {
      _self.set_green_color(_self);
    },
    klass: "green_powerrange"
  });

  _self.init_blue = new Powerange(blue_slider, {
    start: blue,
    min: 0,
    max: 255,
    callback: function() {
      _self.set_blue_color(_self);
    },
    klass: "blue_powerrange"
  });

}

Controller.prototype.hideControls = function() {
  $(this.init_red.slider).addClass(this.id).hide();
  $(this.init_green.slider).addClass(this.id).hide();
  $(this.init_blue.slider).addClass(this.id).hide();
}

Controller.prototype.showControls = function() {
  $(this.init_red.slider).show();
  $(this.init_green.slider).show();
  $(this.init_blue.slider).show();
  setColorField(this.red, this.green, this.blue);
}

Controller.prototype.setControls = function(r,g,b) {
  //TODO: calculate right offset
  this.init_red.setPosition(r);
  this.init_green.setPosition(g);
  this.init_blue.setPosition(b);
}

$("#add_ledstripe").click(function() {
  var form_data = $("#ledstripe_form").serializeArray();
  $.post("/api/ledstripes",
    { name: form_data[0].value, ip: form_data[1].value}, function(data) {
  })
});


var ledstipe_html =
  "<div class=ledstripe data-id={{id}} data-ip={{ip}} data-name={{name}}" +
    " data-red={{red}} data-green={{green}} data-blue={{blue}}>" +
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
    current_leds[el._id].addControls(el.red, el.green, el.blue, el._id);
    current_leds[el._id].hideControls();
  });
});

$('body').delegate('.delete-led','click', function(e) {
  var led_id = $(e.target).parent().attr('data-id');
  $.ajax({
    url: '/api/ledstripes/' + led_id,
    type: 'DELETE',
    success: function(result) {
    }
  })
  $(e.target).parent().remove();
});

$('body').delegate('.select-led','click', function(e) {
  Object.keys(current_leds).forEach(function(key) {
    current_leds[key].hideControls();
  });
  var led_id = $(e.target).parent().attr('data-id');
  current_leds[led_id].showControls();
});

