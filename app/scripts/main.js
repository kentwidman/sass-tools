/*global net, Modernizr, requestAnimFrame */


// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
	'use strict';
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(callback /*, element*/){
				window.setTimeout(callback, 1000 / 60);
			};
})();

var ga = function(){
	'use strict';
};

(function(){
	'use strict';
	var app = {
			settings: {
				hthreshold: 0.001,
				threshold: 0.001,
				defaultColors: ['#F26531', '#1A1A1A'],
			},
			windowWidth: 0,
			windowHeight: 0
		},
		$window = $(window),
		Color = net.brehaut.Color, //color class.
		canvas,
		triPoints,
		triColors = app.settings.defaultColors.slice(0), //deap copy
		colors = {};
		//startTime = new Date().getTime();

	//helper functions
	function roundFraction(value, digits){
		var num = Number(value);
		return num.toFixed(digits);
	}

	function cleanStr(arr){
		var out = arr;
		out = out.replace(/^\s+|\s+$/g, '');
		out = out.replace('#','');
		out = out.toLowerCase();
		return out;
	}

	function isValidColor(color){
		return (/^[a-f0-9]{3}$|^[a-f0-9]{6}$/i).test(color);
	}

	function displayColors(color1, color2){
		var out = color1.toCSS(),
			amount = 0,
			c1 = {
				h: color1.getHue(),
				s: color1.getSaturation(),
				l: color1.getLightness()
			},
			c2 = {
				h: color2.getHue(),
				s: color2.getSaturation(),
				l: color2.getLightness()
			},
			diff = {
				h: c2.h - c1.h,
				s: c2.s - c1.s,
				l: c2.l - c1.l
			};

		if (diff.h > app.settings.hthreshold || diff.h < -app.settings.hthreshold){
			amount = diff.h;
			amount = roundFraction(amount, 0);
			out = 'adjust-hue(' + out + ', ' + amount + 'deg)';
		}

		if (diff.s > app.settings.threshold || diff.s < -app.settings.threshold){
			if (diff.s > 0){
				amount = (diff.s ) * 100;
				amount = roundFraction(amount, 1);
				out = 'saturate(' + out + ', ' + amount + '%)';
			} else {
				amount = (-diff.s) * 100;
				amount = roundFraction(amount, 1);
				out = 'desaturate(' + out + ', ' + amount + '%)';
			}
		}

		if (diff.l > app.settings.threshold || diff.l < -app.settings.threshold){
			if (diff.l > 0){
				amount = (diff.l) * 100;
				amount = roundFraction(amount, 1);
				out = 'lighten(' + out + ', ' + amount + '%)';
			} else {
				amount = (-diff.l) * 100;
				amount = roundFraction(amount, 1);
				out = 'darken(' + out + ', ' + amount + '%)';
			}
		}

		out += ';';
		return out;
	}

	function clearScrean(){
	    if (canvas.getContext){
	        var ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, app.windowWidth, app.windowHeight);
		}
	}

	function drawPoly(points, color) {
	    if (canvas.getContext){
	        var ctx = canvas.getContext('2d');
	        ctx.fillStyle = color;
	        ctx.beginPath();
	        ctx.moveTo(points[0][0], points[0][1]);
	        for(var i = 1; i < points.length; i++){
				ctx.lineTo(points[i][0], points[i][1]);
	        }
	        ctx.closePath();
	        ctx.fill();
	    }
	}


	function render(){
		//var time = new Date().getTime() - startTime;
		//var x = ((time * 0.1) % 200);
		clearScrean();
		drawPoly(
			triPoints[0],
			triColors[0]
		);
		drawPoly(
			triPoints[1],
			triColors[1]
		);
	}

	function animloop(){
		requestAnimFrame(animloop);
		render();
	}

	function resizeCanvas(){
		//get screen size;
		var w = $window.width(),
			h = $window.height();
		app.windowWidth = w;
		app.windowHeight = h;
		canvas.width = w;
		canvas.height = h;

		//landscape mode
		if (Modernizr.mq('only all and (max-width: 768px)')) {
			triPoints = [[[],[],[]],[[],[],[]]];

			//triangle 1
			triPoints[0][0][0] = 0;
			triPoints[0][0][1] = h * 0.62;
			triPoints[0][1][0] = w * 0.15;
			triPoints[0][1][1] = h;
			triPoints[0][2][0] = w;
			triPoints[0][2][1] = h;

			//triangle 2
			triPoints[1][0][0] = w;
			triPoints[1][0][1] = h * 0.6;
			triPoints[1][1][0] = w;
			triPoints[1][1][1] = h;
			triPoints[1][2][0] = 0;
			triPoints[1][2][1] = h;

			$('.js-color-form').removeClass('left-side').addClass('upper');

		} else {
			triPoints = [[[],[],[]],[[],[],[],[]]];

			//triangle 1
			triPoints[0][0][0] = w * 0.47;
			triPoints[0][0][1] = h * (432/803);
			triPoints[0][1][0] = w;
			triPoints[0][1][1] = h * (8/803);
			triPoints[0][2][0] = w;
			triPoints[0][2][1] = h * 0.8;

			//triangle 2
			triPoints[1][0][0] = w * 0.6;
			triPoints[1][0][1] = h;
			triPoints[1][1][0] = w * 0.7;
			triPoints[1][1][1] = h * (46/800);
			triPoints[1][2][0] = w;
			triPoints[1][2][1] = h * (514/800);
			triPoints[1][3][0] = w;
			triPoints[1][3][1] = h;

			$('.js-color-form').removeClass('upper').addClass('left-side');
		}
	}


	/* resize */
	$(document).ready(function() {
		//set up fit text
		$('#about').fitText(1, { minFontSize: '25px', maxFontSize: '92px' });

		//setup triangle code.
		canvas = document.getElementById('triangles');

		$('#color1, #color2').on('input', function(){
			var $this = $(this),
				id = parseInt($this.attr('id').substring(5)) - 1,
				val = cleanStr($this.val());

			//check to make sure input is a valid color.
			if (isValidColor(val)){
				//update color
				colors[id] = new Color('#'+val);
				triColors[id] = '#' + val;

				ga('send', 'event', 'color', 'type', '#' + val);
			} else {
				//revert to default color
				delete colors[id];
				triColors[id] = app.settings.defaultColors[id];
			}

			if (colors[0] && colors[1]) {
				$('#sass-output').html(displayColors(colors[0], colors[1]));
			} else {
				$('#sass-output').html('');
			}
		});

		$(window).bind('resize', resizeCanvas).trigger('resize');

		animloop();
	});
})();