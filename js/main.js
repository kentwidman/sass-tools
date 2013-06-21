var app = {
	contants: {
		hthreshold: 0.001,
		threshold: 0.001,
	}
};
var Color = net.brehaut.Color;

function roundFraction(value, digits){
	var num = Number(value);
	return num.toFixed(digits);
}

function displayColors(color1, color2){
	console.log(color1, color2);
	var out = color1.toCSS(),
		count = 0,
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
			out = 'saturate(' + out + ', ' + amount + ')';
		} else {
			amount = (-diff.s) * 100;
			amount = roundFraction(amount, 1);
			out = 'desaturate(' + out + ', ' + amount + ')';
		}
	}

	if (diff.l > app.contants.threshold || diff.l < -app.contants.threshold){
		if (diff.l > 0){
			amount = (diff.l) * 100;
			amount = roundFraction(amount, 1);
			out = 'lighten(' + out + ', ' + amount + ')';
		} else {
			amount = (-diff.l) * 100;
			amount = roundFraction(amount, 1);
			out = 'darken(' + out + ', ' + amount + ')';
		}
	}

	out += ';';
	$('#sass-output').html(out);
}

$(document).ready(function(){
	var colors = {};

    $('.colorpicker').change(function(){
		var $this = $(this),
			id = $this.attr('id'),
			val = $this.val();
		colors[id] = Color(val);

		if (id === 'color1'){
			$('.arrow-up').css('border-bottom', '150px solid ' + val);
		} else if (id === 'color2') {
			$('.arrow-down').css('border-top', '150px solid ' + val);
		}

		if (colors.color1 && colors.color2){
			displayColors(colors.color1, colors.color2);
		}

	});
});