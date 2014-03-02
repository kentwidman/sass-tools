/*global net, Modernizr */
(function(){
	var app = {
			contants: {
				hthreshold: 0.001,
				threshold: 0.001
			}
		},
		$window = $(window),
		Color = net.brehaut.Color,
		$tris,
		triPoints,
		tri1DefColor = 'F26531',
		tri2DefColor = '1A1A1A',
		colors = {};


	//helper functions
	function roundFraction(value, digits){
		var num = Number(value);
		return num.toFixed(digits);
	}

	function stringToArray(str){
		var pointsStr = str.split(' ');
		var points = [],
			i,
			j;

		for (i=0; i < pointsStr.length; i++){
			points.push(pointsStr[i].split(','));
		}

		for (i=0; i < points.length; i++){
			for (j=0; j < 2; j++){
				points[i][j] = parseInt(points[i][j], 10);
			}
		}
		return points;
	}

	function arrayToString(arr){
		var pointsStr = '';

		for (var i=0; i < arr.length; i++) {
			pointsStr += arr[i][0].toString() + ',' + arr[i][1].toString() + ' ';
		}
		return pointsStr;
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

	function resizeSvg(){
		var h = $window.height(),
			w = $window.width();

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


		var tri1String = arrayToString(triPoints[0]),
			tri2String = arrayToString(triPoints[1]);

		$tris[0].attr('points', tri1String);
		$tris[1].attr('points', tri2String);
	}

	/* resize */
	$(document).ready(function() {
		'use strict';

		//set up fit text
		$('#about').fitText(1, { minFontSize: '25px', maxFontSize: '92px' });

		//set up triangle code.
		$tris = [$('#tri1'), $('#tri2')];

		//set up triangle points points
		var triPointsStr = [$tris[0].attr('points'), $tris[1].attr('points')];
		triPoints = [
			stringToArray(triPointsStr[0]),
			stringToArray(triPointsStr[1])
		];

		$('#color1, #color2').on('input', function(){
			var $this = $(this),
				validIds = ['color1','color2'],
				id = $this.attr('id'),
				val = cleanStr($this.val());

			//check to make sure input is a valid color.
			if (isValidColor(val)){
				//update color
				colors[id] = new Color('#'+cleanStr(val));
				for (var i = 0; i < $tris.length; i++) {
					if (id === validIds[i]) {
						$tris[i].attr('fill', '#'+val);
						break;
					}
				}
			} else {
				//revert to default color
				delete colors[id];
				for (var i = 0; i < $tris.length; i++){
					if (id === validIds[i]) {
						$tris[i].attr('fill', '#'+tri1DefColor);
						break;
					}
				}
			}

			if (colors.color1 && colors.color2) {
				$('#sass-output').html(displayColors(colors.color1, colors.color2));
			} else {
				$('#sass-output').html('');
			}
		});


		$(window).bind('resize', resizeSvg).trigger('resize');

	});
})();