;(function(window, document, undefined){
  
  var oldMaker = (window.Maker ? window.Maker : undefined);
  
  var Maker = { 
    ready: false,
    noConflict: function() {
      window.Maker = oldMaker;
      return this;
    }
  };  
  
  window.Maker = Maker;
  
})(window, document);