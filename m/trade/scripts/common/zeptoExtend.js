;(function($, undefined){
  var prefix = '', eventPrefix,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
    testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming, transitionDelay,
    animationName, animationDuration, animationTiming, animationDelay,
    cssReset = {}

  function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionDelay    = prefix + 'transition-delay'] =
  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
  cssReset[animationName      = prefix + 'animation-name'] =
  cssReset[animationDuration  = prefix + 'animation-duration'] =
  cssReset[animationDelay     = prefix + 'animation-delay'] =
  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback, delay){
    if ($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if ($.isFunction(ease))
      callback = ease, ease = undefined
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if (delay) delay = parseFloat(delay) / 1000
    return this.anim(properties, duration, ease, callback, delay)
  }

  $.fn.anim = function(properties, duration, ease, callback, delay){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
        fired = false

    if (duration === undefined) duration = $.fx.speeds._default / 1000
    if (delay === undefined) delay = 0
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      } else
        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

      fired = true
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0){
      this.bind(endEvent, wrappedCallback)
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function(){
        if (fired) return
        wrappedCallback.call(that)
      }, ((duration + delay) * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null;
  $.fn.slideDown = function (duration, callback) {
	    var that = this;
	    if(that.css("display") !== "none")
	    {
		    callback && callback.call(that);
	    	return that;
	    }
		switch(duration)
		{
			case "slow": 
				duration = 600;
				break;
			case "normal": 
				duration = 400;
				break;
			case "fast": 
				duration = 200;
				break;
		}
		duration = typeof(duration) === "undefined" ? 400 : duration;
		duration = (+duration + "") === "NaN"? 400 : +duration;
    	var originalCss = that[0].style.cssText;
	    that.css("display", "block").css("overflow", "hidden");
    	var height = that.height();
    	that.css("height", 0);
	    setTimeout(function(){
		    that.animate({
		        height: height
		    }, duration, "linear", function(){
		    	that[0].style.cssText = originalCss; // 恢复原有的 css
		    	that.css("display", "block");
		    	callback && callback.call(that);
		    });
	    }, 0);
	    return that;
	};
	
	$.fn.slideUp = function (duration, callback) {
	    var that = this;
	    if(that.css("display") === "none")
	    {
	    	callback && callback.call(that);
	    	return that;
	    }
		switch(duration)
		{
			case "slow": 
				duration = 600;
				break;
			case "normal": 
				duration = 400;
				break;
			case "fast": 
				duration = 200;
				break;
		}
		duration = typeof(duration) === "undefined" ? 400 : duration;
		duration = (+duration + "") === "NaN"? 400 : +duration;
	    setTimeout(function(){
			var height = that.height();
			var originalCss = that[0].style.cssText;
			that.css("overflow", "hidden").css("height", height + "px");
		    that.animate({
		        height: 0
		    }, duration, "linear", function(){
		    	that[0].style.cssText = originalCss; // 恢复原有的 css
		    	that.css("display", "none");
		    	callback && callback.call(that);
		    });
	    }, 0);
	    return that;
	};
	
	$.fn.slideToggle = function (duration, callback) {
		var that = this;
	    if(that.css("display") === "none")
	    {
	    	that.slideDown(duration, callback);
	    }
	    else
	    {
	    	that.slideUp(duration, callback);
	    }
	    return that;
	};
	$.fn.trim = function(data){
		if(typeof data == "string"){
			return data.replace(/(^\s*)|(\s*$)/g,"");
		}
		else{
			return data;
		}
	}
	
	$.fn.showLeft = function(duration, ease, callback, delay){
		this.css("left","100%");
		this.show();
    return this.animate({"left":"0%"}, duration, "fast", callback, delay)
  }
	$.fn.hideLeft = function(duration, ease, callback, delay){
		var t = this;
   	return this.animate({"left":"100%"}, duration, "fast", function(){
   		t.hide();
			t.css("left","0%");
			if(callback){
				callback();
			}
   	}, delay)
  }
	$.getCurrentPageObj = function() {
    var a = sessionStorage.getItem("_curPage") || "";
    return a && (a = JSON.parse(a)),a
  }
	$.fn.quzhi = function(t){
		// if(this && this[0]){
		// 	var a = this[0].localName;
		// 	if(a == "input"){
		// 		return 0 in arguments ? this.each(function(e) {
	     //        this.value = t
	     //    }) : 0 in this ? this[0].value : ''
		// 	}
		// 	else{
		// 		 return 0 in arguments ? this.each(function(e) {
	     //        this.textContent = t
	     //    }) : 0 in this ? this[0].textContent : ''
		// 	}
		// }
		// else{
		// 	return '';
		// }
		if(this && this[0]){
			if(this.length > 1 && $(this).eq(0).attr("js-key") && typeof(t) != "undefined"){
				for(var i = 0;i < this.length; i++){
					if(this[i].localName == "input" && $(this).eq(i).attr("js-key")){
						this[i].value = t;
					}
					else if(this[i].localName == "div" && $(this).eq(i).hasClass("jsKey")){
						this.eq(i).attr("value",t);
						this.eq(i).children("em").text(t);
						this.eq(i).find("div.key_text").html(t);
						if(t.length == 0){
							this.eq(i).find("div.key_place").show();
						}else{
							this.eq(i).find("div.key_place").hide();
						}
					}
					else{
						var a = this[i].localName;
						if(a == "input"){
							return 0 in arguments ? this[i].each(function(e) {
								this.value = t
							}) : 0 in this[i] ? this[i].value : ''
						}
						else{
							return 0 in arguments ? this[i].each(function(e) {
								this.textContent = t
							}) : 0 in this[i] ? this[i].textContent : ''
						}
					}
				}
			}
			else{
				var a = this[0].localName;
				if(a == "input"){
					return 0 in arguments ? this.each(function(e) {
						this.value = t
					}) : 0 in this ? this[0].value : ''
				}
				else{
					return 0 in arguments ? this.each(function(e) {
						this.textContent = t
					}) : 0 in this ? this[0].textContent : ''
				}
			}
		}
		else{
			return '';
		}
	}
	// 复制对象
	$.cloneFun = function(obj){
	  if(!obj||"object" != typeof obj){
	    return null;
	  }
	  var result = (obj instanceof Array)?[]:{};
	  for(var i in obj){
  	 	if (!obj.hasOwnProperty(i)) continue;
	    result[i] = ("object" != typeof obj[i])?obj[i]:$.cloneFun(obj[i]);
	  }
	  return result;
	}
})(Zepto)