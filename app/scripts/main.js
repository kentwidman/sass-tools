/*global net, Modernizr */


// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();



(function(){
	var app = {
			settings: {
				hthreshold: 0.001,
				threshold: 0.001,
				defaultColors: ['F26531', '1A1A1A'],
			},
			windowWidth: 0,
			windowHeight: 0
		},
		$window = $(window),
		Color = net.brehaut.Color, //color class.
		canvas,
		triPoints = [[[],[],[]],[[],[],[],[]]],
		triColors = app.settings.defaultColors,
		colors = {},
		startTime = new Date().getTime();


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
		//console.log(color1, color2);
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

		if (diff.h > app.contants.hthreshold || diff.h < -app.contants.hthreshold){
			amount = diff.h;
			amount = roundFraction(amount, 0);
			out = 'adjust-hue(' + out + ', ' + amount + 'deg)';
		}

		if (diff.s > app.contants.threshold || diff.s < -app.contants.threshold){
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

		if (diff.l > app.contants.threshold || diff.l < -app.contants.threshold){
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

	function clear_screan(){
	    if (canvas.getContext){
	        var ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, app.windowWidth, app.windowHeight);
		}
	}

	function drawPoly(points, color) {
	    if (canvas.getContext){
	        var ctx = canvas.getContext('2d');

	        ctx.beginPath();
	        ctx.moveTo(points[points.length-1][0], points[points.length-1][0]);
	        for(var i = 0; i < points.length; i++){
	        	ctx.lineTo(points[i][0], points[i][1]);
	        }
	        
	        ctx.fillStyle = color;
	        ctx.fill();   
	    }
	}


	function render(){
		var time = new Date().getTime() - startTime;

		var x = ((time * 0.1) % 200);
		clear_screan();
		triPoints[0][0][0]
		drawPoly(
			triPoints[0],
			triColors[0]
		);
		drawPoly(
			triPoints[1],
			triColors[1]
		);
		//draw_triangle('410','48', x.toString(),'86','420','135', triColors[1]);
	}

	function animloop(){
	  requestAnimFrame(animloop);
	  render();
	}

	function resizeCanvas(){
		//get screen size;
		var w = $(window).width(),
			h = $(window).height();
		app.windowWidth = w;
		app.windowHeight = h;
		canvas.width = w;
		canvas.height = h;

		//landscape mode
		if (Modernizr.mq('only all and (max-width: 768px)')) {

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
			triPoints[1][2][0] = w;
			triPoints[1][2][1] = h;
			triPoints[1][3][0] = 0;
			triPoints[1][3][1] = h;

			$('.js-color-form').removeClass('left-side').addClass('upper');

		} else {

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

		animloop();
	}


	/* resize */
	$(document).ready(function() {
		'use strict';

		//setup fit text
		$('#about').fitText(1, { minFontSize: '25px', maxFontSize: '95px' });


		//setup triangle code.
		canvas = document.getElementById('triangles');

		$('#color1, #color2').on('input', function(){
			var $this = $(this),
				validIds = ['color1','color2'],
				id = parseInt($this.attr('id').substring(4)) - 1,
				val = cleanStr($this.val());

			//check to make sure input is a valid color.
			if (isValidColor(val)){
				//update color
				colors[id] = new Color('#'+val);
				triColors[id] = val;		
			} else {
				//revert to default color
				delete colors[id];
				//$tris[id].attr('fill', '#'+app.settings.defaultColors[id]);
				triColors[id] = val;
			}

			if (colors.color1 && colors.color2) {
				$('#sass-output').html(displayColors(colors.color1, colors.color2));
			} else {
				$('#sass-output').html('');
			}
		});


		$(window).bind('resize', resizeCanvas).trigger('resize');

	});
})();