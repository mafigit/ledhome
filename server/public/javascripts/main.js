$(function() {
  var red_slider = document.querySelector('.red_slider');
  var green_slider = document.querySelector('.green_slider');
  var blue_slider = document.querySelector('.blue_slider');
  var color_field = document.querySelector('.current_color')

  red_slider.value = 0;
  green_slider.value = 0;
  blue_slider.value = 0;

  var init_red = new Powerange(red_slider, {
    start: 0,
    min: 0,
    max: 255,
    callback: function() {
      setColor(null);
    },
    klass: "red_powerrange"
  });

  var init_green = new Powerange(green_slider, {
    start: 0,
    min: 0,
    max: 255,
    callback: function() {
      setColor(null);
    },
    klass: "green_powerrange"
  });

  var init_blue = new Powerange(blue_slider, {
    start: 0,
    min: 0,
    max: 255,
    callback: function() {
      setColor(null);
    },
    klass: "blue_powerrange"
  });

  function setColor(ledstripe) {
    var red = parseInt(red_slider.value);
    var green = parseInt(green_slider.value);
    var blue = parseInt(blue_slider.value);
    $.get('/setled', {color: 'red', value: red}, function(data) {
    });
    $.get('/setled', {color: 'green', value: green}, function(data) {
    });
    $.get('/setled', {color: 'blue', value: blue}, function(data) {
    });
    var rgbvalue = rgbToHex(red, green , blue);
    var rgbvalue = rgbToHex(red, green , blue);
    var rgbvalue = rgbToHex(red, green , blue);

    color_field.style.backgroundColor=rgbvalue;
  }

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

});
