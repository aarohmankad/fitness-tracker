var Stopwatch = function(elem, options) {
  
  var timer       = createTimer(),
      offset,
      clock,
      interval;
  
  // default options
  options = options || {};
  options.delay = options.delay || 1;
 
  // append elements     
  elem.appendChild(timer);
  
  // initialize
  reset();
  
  // private functions
  function createTimer() {
    return document.createElement("span");
  }
  
  function createButton(action, handler) {
    var a = document.createElement("a");
    a.href = "#" + action;
    a.innerHTML = action;
    a.addEventListener("click", function(event) {
      handler();
      event.preventDefault();
    });
    return a;
  }
  
  function start() {
    if (!interval) {
      offset   = Date.now();
      interval = setInterval(update, options.delay);
    }
  }
  
  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
  
  function reset() {
    clock = 0;
    render();
  }
  
  function update() {
    clock += delta();
    render();
  }
  
  function render() {
    timer.innerHTML = clock/1000; 
  }
  
  function delta() {
    var now = Date.now(),
        d   = now - offset;
    
    offset = now;
    return d;
  }
  
  // public API
  this.start  = start;
  this.stop   = stop;
  this.reset  = reset;
};

var elem = document.getElementById('stopwatch');

var stopwatch = new Stopwatch(elem, {delay:1000});

document.getElementById('stopwatch-btn').addEventListener('click', function (event) {
  stopwatch.start();
  var stopwatch_btn = document.getElementById('stopwatch-btn');
  stopwatch_btn.innerHTML = '<button class="btn btn-block btn-warning" id="stop-btn">Stop Run!</button>';
});