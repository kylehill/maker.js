;(function(window, document, undefined){
  
  var oldMaker = (window.Maker ? window.Maker : undefined);
  
  var ns = "http://www.w3.org/2000/svg";
  
  var Maker = { 
    noConflict: function() {
      window.Maker = oldMaker;
      return this;
    },
    
    globalDefaults: {
      interval: 13,
      animates: true,
      animationLength: 1000
    },
    
    typeDefaults: {
      concentric: {
        buffer: 5,
        innerColor: "rgb(28,213,89)",
        outerColor: "rgb(218,217,236)",
        dashed: true,
        outerWidth: 1,
        drawOuter: true,
        animationLength: 500
      },
      line: {
        
      },
      bar: {
        
      },
      pie: {
        
      },
      scatter: {
        
      },
      pareto: {
        
      },
      thermometer: {
        
      },
      gauge: {
        
      }
    }
  };
  
  var extend = function() {
    var out = {};
    for (var arg in arguments) {
      for (var i in arguments[arg]) {
        out[i] = arguments[arg][i];
      }
    }
    return out;
  };
  
  var forEach = function(arr, iterator) {
    if (arr instanceof Array) {
      if (Array.prototype.forEach) {
        arr.forEach(iterator);
        return;
      }
      for (var i = 0; i < arr.length; i++) {
        iterator(arr[i], i);
      }
      return;  
    }
    for (var i in arr) {
      iterator(arr[i], i);
    }
  }
  
  var map = function(arr, iterator) {
    if (Array.prototype.map) {
      return arr.map(iterator);
    }
    var outbound = [];
    forEach(arr, function(value, i){
      outbound.push(iterator(value, i));
    });
    return outbound;
  };
  
  var reduce = function(arr, iterator, mem) {
    if (Array.prototype.reduce) {
      return arr.reduce(iterator, mem);
    }
    forEach(arr, function(value, i){
      mem = iterator(mem, value, i);
    });
    return mem;
  };
  
  var max = function(arr) {
    var outbound;
    forEach(arr, function(val, i){
      if (!i || val > outbound) {
        outbound = val;
      }
    });
    return outbound;
  };
  
  var min = function(arr) {
    var outbound;
    forEach(arr, function(val, i){
      if (!i || val < outbound) {
        outbound = val;
      }
    });
    return outbound;
  };
  
  var utils = {
    forEach: forEach
  }
  
  var builder = {
    
    init: function(element, chartType, options) {
      var element = this.cleanElement(element);
      var options = extend(Maker.globalDefaults, Maker.typeDefaults[chartType], options);
      var svg = element.appendChild(shaper.svg());
      
      return { 
        element: element,
        svg: svg,
        options: options,
        shapes: {}
      };
    },
    
    cleanElement: function(element) {
      if (element.jquery) { element = element[0]; }
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      return element;
    },
    
    setAttributes: function(element, data) {
      for (var key in data) {
        if (key == "value") {
          element.textContent = data[key]; continue;
        }
        switch (typeof data[key]) {
          case "boolean":
          case "number":
          case "string":
            element.setAttributeNS(null, key, data[key]);
            break;
        }
      }
      return element;
    }
    
  };
  
  var shaper = {
    
    svg: function(data) {
      var svg = document.createElementNS(ns, "svg");
      svg = builder.setAttributes(svg, data);
      return svg;
    },
    
    circle: function(data) {
      var circle = document.createElementNS(ns, "circle");
      circle = builder.setAttributes(circle, data);
      return circle;
    }
    
  };
  
  var animator = {
    
    transition: function(m, element, properties) {
      
    }
    
  };
  
  Maker = extend(Maker, {
    
    concentric: function(element, data, options) {
      options.height = options.height || element.clientHeight;
      options.width = options.width || element.clientWidth;
      
      var m = builder.init(element, "concentric", options);
      
      m.options.radius = m.options.radius || (Math.min(m.options.height, m.options.width) / 2) - m.options.buffer;
      m.options.centerX = m.options.centerX || m.options.radius + m.options.buffer;
      m.options.centerY = m.options.centerY || m.options.radius + m.options.buffer;
      m.options.drawOuter = m.options.drawOuter && (data < 1 && m.options.outerWidth > 0);
      
      m.svg.setAttribute("height", m.options.height);
      m.svg.setAttribute("width", m.options.width);
      
      // Build outer circle
      if (m.options.drawOuter) {
        var outer = {
          cx: m.options.centerX,
          cy: m.options.centerY,
          r: m.options.radius,
          fill: "none",
          stroke: m.options.outerColor,
          "stroke-width": m.options.outerWidth
        }
        if (m.options.dashed) {
          outer["stroke-dasharray"] = "9, 5";
        }
        m.shapes.outer = shaper.circle(outer);
      }
      
      // Build
      var inner = {
        cx: m.options.centerX,
        cy: m.options.centerY,
        r: 0,
        fill: m.options.innerColor,
        "stroke-width": 0,
        "stroke-join": "round",
        "stroke-linecap": "round"
      }
      m.shapes.inner = shaper.circle(inner);
      
      m.render = function(data) {
        if (m.isRendered) { m.update(data); return; }
        m.draw();
        m.update(data);
      };
      
      m.draw = function() {
        forEach(m.shapes, function(shape){
          m.svg.appendChild(shape);
        });
        m.isRendered = true;
      };
      
      m.update = function(data) {
        var ticks = (m.options.animationLength / m.options.interval);
        
        var startVal = (m.shapes.inner.getAttribute("r") * 1);
        var endVal = (m.options.radius * (Math.min(data, 1)));
        
        var tickDelta = (endVal - startVal) / ticks;

        for (var i = 1; i < ticks; i++) {
          window.setTimeout(function(updateTo){
            m.shapes.inner.setAttribute("r", updateTo);
          }, (i * m.options.interval), (startVal + (i * tickDelta)));
        }
        
        animator.transition(m, m.shapes.inner, { r: (m.options.radius * (Math.min(data, 1))) });
      };
      
      m.unload = function() {
        m.isRendered = false;
        builder.cleanElement(m.svg);
      };

      m.render(data);
      return m;
    },
    
    line: function(element, data, options) {
      var m = builder.init(element, "line", options);
    },
    
    pie: function(element, data, options) {
      var m = builder.init(element, "pie", options);
    },
    
    bar: function(element, data, options) {
      var m = builder.init(element, "bar", options);
    },
    
    scatter: function(element, data, options) {
      var m = builder.init(element, "scatter", options);
    },
    
    pareto: function(element, data, options) {
      var m = builder.init(element, "pareto", options);
    },
    
    thermometer: function(element, data, options) {
      var m = builder.init(element, "thermometer", options);
    },
    
    gauge: function(element, data, options) {
      var m = builder.init(element, "gauge", options);
    }
    
  })
  
  window.Maker = Maker;
  
})(window, document);