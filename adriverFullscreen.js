/* Adriver HTML-Fullscreen on ajaxJS code. Developed A.Fedotov 29.10.2013. Last edited A.Fedotov 03.07.2014 */

(function(){
	document.write('<script src="//content.adriver.ru/html.js"><\/script>');
	var isDomReady = false;
	function checkDomReady(f){
		try {
			var w = window, d = w.document, oldOnLoad, topLevel, ready = function(){if(isDomReady){return;}f();}, readyStateChange;
			if (d.readyState === 'complete') {
				ready();
			} else if (d.addEventListener) {
				d.addEventListener('DOMContentLoaded', ready, false);
				w.addEventListener('load', ready, false);
			} else if (d.attachEvent) {
				readyStateChange = function(){if(d.readyState==='complete'){d.detachEvent('onreadystatechange', readyStateChange);ready();}};
				d.attachEvent('onreadystatechange', readyStateChange);
				w.attachEvent('onload', ready);
				topLevel = false;
				try{topLevel = w.frameElement === null && d.documentElement;}catch(e){}
				if (topLevel && topLevel.doScroll) {
					(function doScrollCheck() {
						if (!adriver.isDomReady) {
							try {topLevel.doScroll('left');} catch(e) {return setTimeout(doScrollCheck, 50);}
							ready();
						}
					})();
				}
			} else if (/WebKit/i.test(navigator.userAgent)) {
				(function(){/loaded|complete/.test(d.readyState) ? ready() : setTimeout(arguments.callee, 50);})();
			} else {
				oldOnLoad = w.onload;
				w.onload = function(){if(oldOnLoad){oldOnLoad();} ready();};
			}
		}catch(e){}
	}
	function getElementsByClassName(className, tag, elm){
		if (document.getElementsByClassName) {
			getElementsByClassName = function (className, tag, elm) {
				elm = elm || document;
				var elements = elm.getElementsByClassName(className),
					nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
					returnElements = [],
					current;
				for(var i=0, il=elements.length; i<il; i+=1){
					current = elements[i];
					if(!nodeName || nodeName.test(current.nodeName)) {
						returnElements.push(current);
					}
				}
				return returnElements;
			};
		}
		else if (document.evaluate) {
			getElementsByClassName = function (className, tag, elm) {
				tag = tag || "*";
				elm = elm || document;
				var classes = className.split(" "),
					classesToCheck = "",
					xhtmlNamespace = "http://www.w3.org/1999/xhtml",
					namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
					returnElements = [],
					elements,
					node;
				for(var j=0, jl=classes.length; j<jl; j+=1){
					classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
				}
				try	{
					elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
				}
				catch (e) {
					elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
				}
				while ((node = elements.iterateNext())) {
					returnElements.push(node);
				}
				return returnElements;
			};
		}
		else {
			getElementsByClassName = function (className, tag, elm) {
				tag = tag || "*";
				elm = elm || document;
				var classes = className.split(" "),
					classesToCheck = [],
					elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
					current,
					returnElements = [],
					match;
				for(var k=0, kl=classes.length; k<kl; k+=1){
					classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
				}
				for(var l=0, ll=elements.length; l<ll; l+=1){
					current = elements[l];
					match = false;
					for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
						match = classesToCheck[m].test(current.className);
						if (!match) {
							break;
						}
					}
					if (match) {
						returnElements.push(current);
					}
				}
				return returnElements;
			};
		}
		return getElementsByClassName(className, tag, elm);
	}
	function addEvent(e, t, f){
		if (e.addEventListener) e.addEventListener(t, f, false); else if (e.attachEvent) {
			e.attachEvent('on' + t, function () { f.call(e); })
		}
	}
	function getEvent(e, _this) {
		e = e || window.event;

		if (!e.currentTarget) { e.currentTarget = _this; }
		if (!e.target) { e.target = e.srcElement; }

		return e;
	}

	arFS = {
		time: 15,

		timer: {},

		visEvent: 'visibilitychange',

		click: function(event){
			var el = event.currentTarget,
				target = el.getAttribute('data-target') || ar_target,
				link = el.getAttribute('data-redirect'),
				cgiHref = ar_redirect + (link ? escape(link) : '');

			switch (target){
				case '_top': window.top.location = cgiHref; break;
				case '_self': document.location = cgiHref; break;
				default: window.open(cgiHref);
			}

			if (el.className.indexOf('adriverClose') !== -1) this.close();
		},

		close: function(){ this.sendCommand('close'); },

		sendCommand: function(c){
			if (typeof(window.postMessage) != 'undefined'){
				parent.postMessage(c, '*');
			}
			else{
				var l = window.location.toString();
				l = l.substr(0, l.indexOf('#'));
				window.location.replace(l + '#' + c);
			}
		},

		addEvents: function(c, e, f){
			var i, el, els = getElementsByClassName(c);

			for(i in els){
				if (els.hasOwnProperty(i)){
					el = els[i];
					if (c === 'adriverClose' && el.className.indexOf('adriverClick') !== -1) continue;
					addEvent(el, e, f);
				}
			}
		},

		getTimer: function(){
			var that = this;
			var timeEl = getElementsByClassName('adriverReturn') ? getElementsByClassName('adriverReturn')[0] : {};
			if (timeEl){
				that.time = timeEl.getAttribute('data-time') || that.time;

				that.addEvents('adriverPause', 'mouseover', function(){that.pause.call(that)});
				that.addEvents('adriverPause', 'mouseout', function(){that.setTimer(timeEl)});

				if (!that.isPageHidden()) that.setTimer(timeEl);
				addEvent(document, that.visEvent, function(){that.isReturn.call(that, timeEl)});
			}
		},

		setTimer: function(e){
			var that = this,
				mess = e.getAttribute('data-message');

			e.innerHTML = mess.replace('%time%', that.time);
			this.timer = setInterval(function(){
				if (that.time === 0){
					clearInterval(that.timer);
					that.sendCommand('close');
					return false;
				}
				--that.time;
				e.innerHTML = mess.replace('%time%', that.time);
			}, 1000);
		},

		pause: function(){clearInterval(this.timer)},

		isPageHidden: function(){
			if (typeof document.hidden !== 'undefined') return document.hidden;
			var prefs = ['webkit', 'moz', 'o', 'ms'], l = prefs.length;
			for (var i = 0; i < l; i++)
				if (typeof document[prefs[i] + 'Hidden'] !== 'undefined'){
					this.visEvent = prefs[i] + 'visibilitychange';
					return document[prefs[i] + 'Hidden'];
				}
			return false;
		},

		isReturn: function(e){(!this.isPageHidden()) ? this.setTimer(e) : this.pause.call(this)},

		start: function(){
			var that = this;

			this.addEvents('adriverClick', 'click', function(e){that.click.call(that, getEvent(e, this))});
			this.addEvents('adriverClose', 'click', function(e){that.close.call(that, getEvent(e, this))});

			this.getTimer();

			this.sendCommand('event');
		}
	};

	checkDomReady(function(){
		isDomReady = true;
		arFS.start();
	});
})();