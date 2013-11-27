/*global net, Modernizr */
var app = {
	contants: {
		hthreshold: 0.001,
		threshold: 0.001
	}
};
var Color = net.brehaut.Color;

function roundFraction(value, digits){
	'use strict';
	var num = Number(value);
	return num.toFixed(digits);
}

function displayColors(color1, color2){
	'use strict';

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

function stringToArray(str){
	'use strict';

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
	'use strict';

	var pointsStr = '';

	for (var i=0; i < arr.length; i++) {
		pointsStr += arr[i][0].toString() + ',' + arr[i][1].toString() + ' ';
	}
	return pointsStr;
}

function cleanStr(arr){
	'use strict';

	var out = arr;
	out = out.replace(/^\s+|\s+$/g, '');
	out = out.replace('#','');
	out = out.toLowerCase();
	return out;
}

function isValidColor(color){
	'use strict';
	return '/^[a-f0-9]{3}$|^[a-f0-9]{6}$/i'.test(color);
}

/* resize */
$(document).ready(function() {
	'use strict';
	var $window = $(window),
		colors = {},
		tri1 = $('#tri1'),
		tri2 = $('#tri2'),
		tri1PointsStr = tri1.attr('points'),
		tri2PointsStr = tri2.attr('points'),
		//tri1Color = tri1.attr('fill'),
		//tri2Color = tri2.attr('fill'),
		tri1Points = stringToArray(tri1PointsStr),
		tri2Points = stringToArray(tri2PointsStr),
		tri1DefColor = 'F26531',
		tri2DefColor = '1A1A1A';


	$('#color1, #color2').on('input', function(){
		var $this = $(this),
			id = $this.attr('id'),
			val = cleanStr($this.val());

		if (isValidColor(val)){
			colors[id] = new Color('#'+cleanStr(val));
			if (id === 'color1') {
				tri1.attr('fill', '#'+val);
			} else if (id === 'color2') {
				tri2.attr('fill', '#'+val);
			}
		} else {
			delete colors[id];
			if (id === 'color1') {
				tri1.attr('fill', '#'+tri1DefColor);
			} else if (id === 'color2') {
				tri2.attr('fill', '#'+tri2DefColor);
			}
		}

		if (colors.color1 && colors.color2) {
			$('#sass-output').html(displayColors(colors.color1, colors.color2));
		} else {
			$('#sass-output').html('');
		}
	});


	$(window).bind('resize', function(){

		var h = $window.height(),
			w = $window.width();

		//landscape mode
		if (Modernizr.mq('only all and (max-width: 768px)')) {

			//triangle 1
			tri1Points[0][0] = 0;
			tri1Points[0][1] = h * 0.62;
			tri1Points[1][0] = w * 0.15;
			tri1Points[1][1] = h;
			tri1Points[2][0] = w;
			tri1Points[2][1] = h;

			//triangle 2
			tri2Points[0][0] = w;
			tri2Points[0][1] = h * 0.6;
			tri2Points[1][0] = w;
			tri2Points[1][1] = h;
			tri2Points[2][0] = w;
			tri2Points[2][1] = h;
			tri2Points[3][0] = 0;
			tri2Points[3][1] = h;

			$('.js-color-form').removeClass('left-side').addClass('upper');

		} else {

			//triangle 1
			tri1Points[0][0] = w * 0.47;
			tri1Points[0][1] = h * (432/803);
			tri1Points[1][0] = w;
			tri1Points[1][1] = h * (8/803);
			tri1Points[2][0] = w;
			tri1Points[2][1] = h * 0.8;

			//triangle 2
			tri2Points[0][0] = w * 0.6;
			tri2Points[0][1] = h;
			tri2Points[1][0] = w * 0.7;
			tri2Points[1][1] = h * (46/800);
			tri2Points[2][0] = w;
			tri2Points[2][1] = h * (514/800);
			tri2Points[3][0] = w;
			tri2Points[3][1] = h;

			$('.js-color-form').removeClass('upper').addClass('left-side');
		}


		var tri1String = arrayToString(tri1Points),
			tri2String = arrayToString(tri2Points);

		tri1.attr('points', tri1String);
		tri2.attr('points', tri2String);

	}).trigger('resize');
});





