/* Adriver HTML-Fullscreen on ajaxJS code. Developed A.Fedotov 29.10.2013. Last edited A.Fedotov 03.07.2014 */

var ar_html		= 'index.html';
var ar_pix		= '';

/****************************/
var a = adriver(ar_ph);

new adriver.Plugin.require('pixel.adriver', 'html.adriver', 'functions.adriver', 'event.adriver').onLoadComplete(function () {
	a.onDomReady(function () {
		a.sendPixel(ar_pix);

		var D = document,
			B = D.body,
			d_key = D.onkeypress,
			d_wheel = D.onmousewheel,
			b_margin = a.getStyle(B, 'margin'),
			b_padding = a.getStyle(B, 'padding'),
			full,
			cancel = function (e) {
				e=e||window.event;

				if (e.stopPropagation) e.stopPropagation();
				else e.cancelBubble = true;

				if (e.preventDefault) e.preventDefault();

				return false
			},
			remove = function () {if (full&&full.style) full.style.top = a.normalize(a.getScreenGeometry().st)},
			resize = function () {if (full&&full.style) full.style.height = a.normalize(a.getScreenGeometry().ch)};

		B.style.margin = B.style.padding = '0px';
		D.onkeypress = D.onmousewheel = cancel;
		a.addEvent(document, 'DOMMouseScroll', cancel);
		a.addEvent(window, 'resize', resize);
		a.addEvent(window, 'scroll', remove);

		function close() {
			B.style.margin = b_margin;
			B.style.padding = b_padding;
			D.onkeypress = d_key;
			D.onmousewheel = d_wheel;
			a.removeEvent(document, 'DOMMouseScroll', cancel);
			a.removeEvent(window, 'resize', resize);
			a.removeEvent(window, 'scroll', remove);

			if (full.parentNode) full.parentNode.removeChild(full);
		}
		function dispatcher(mess) {
			switch (mess) {
				case 'close': close(); break;
				case 'event': a.event(0); break;
			}
		}

		setTimeout(function () {
			full = a.addDiv(
				document.body,
				{zIndex: 65000, position: 'absolute', width: '100%', left: '0px', top: a.normalize(a.getScreenGeometry().st), height: a.normalize(a.getScreenGeometry().ch)},
				a.makeHTML('100%', '100%', ar_html)
			);

			if (typeof window.postMessage != 'undefined') {
				var loc = /^((?:http(?:s)?:)?\/\/(?:\w+\.)+\w+).*/i.exec(ar_html);
				loc = a.httplize((loc ? loc[1] : a.reply.mirror));
				adriver.addEvent(window, 'message', function (e) {
					if (e.origin !== loc) return false;
					dispatcher(e.data);
				});
			} else {
				function getIframeDocument(iframeNode) {
					if (iframeNode.contentDocument) return iframeNode.contentDocument
					if (iframeNode.contentWindow) return iframeNode.contentWindow.document
					return iframeNode.document
				}
				var i = getIframeDocument(full.firstChild);
				(function _() {
					var h = i.location.hash.substr(1);
					if (h){
						dispatcher(h);
						var l = i.location.toString();
						l = l.substr(0, l.indexOf('#') + 1);
						i.location.replace(l);
					}
					if (h === 'close') return true;
					setTimeout(arguments.callee, 100);
				})();
			}
		}, 500);

		a.loadComplete();
	})
});