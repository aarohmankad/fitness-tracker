var fb = new Firebase("https://mvhs-fitness-tracker.firebaseio.com/");

var Stopwatch = function(elem, options) {

  var timer       = createTimer(),
      startButton = createButton("start", start),
      stopButton  = createButton("stop", stop),
      resetButton = createButton("reset", reset),
      offset,
      clock,
      interval;

  // default options
  options = options || {};
  options.delay = options.delay || 1;

  // append elements     
  elem.appendChild(timer);
  elem.appendChild(startButton);
  elem.appendChild(stopButton);
  elem.appendChild(resetButton);

  // initialize
  reset();

  // private functions
  function createTimer() {
    var timer = document.createElement("div");
    timer.className = "stopwatch_time";
    return timer;
  }

  function createButton(action, handler) {
    var btn = document.createElement("button");
    btn.className = "btn" + " btn-block" + " stopwatch_" + action;

    if(action == "start")
      btn.className = btn.className + " btn-success";
    if(action == "stop")
      btn.className = btn.className + " btn-danger";
    if(action == "reset")
      btn.className = btn.className + " btn-warning";

    btn.innerHTML = action;
    btn.addEventListener("click", function(event) {
      handler();
      event.preventDefault();
    });
    return btn;
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

  function getTime () {
    var time = document.getElementsByClassName('stopwatch_time')[0];
    return time.innerHTML;
  }

  // public API
  this.start  = start;
  this.stop   = stop;
  this.reset  = reset;
  this.getTime = getTime;
};

var elem = document.getElementById('stopwatch');

var stopwatch = new Stopwatch(elem, {delay:1000});

document.getElementById("student_id").addEventListener('keypress', function (event) {
  if(event.keyCode != 13)
    return
  fb.child(document.getElementById('student_id').value).push({
    time: stopwatch.getTime()
  });
});