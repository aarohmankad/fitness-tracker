var fb = new Firebase("https://mvhs-fitness-tracker.firebaseio.com/");

var count = 0;

var Stopwatch = function(elem, options) {

  var timer       = createTimer(),
      startButton = createButton("start", start),
      stopButton  = createButton("stop", stop),
      resetButton = createButton("reset", reset),
      offset,
      clock,
      minutes,
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

    // Project specific code
    document.getElementById("student_id_input").focus();
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  function reset() {
    clock = 0;
    minutes = 0;

    // Project specific code
    var json_data_request = new XMLHttpRequest();
    json_data_request.onreadystatechange = function () {
      if(json_data_request.readyState == 4)
        if(json_data_request.status == 200 || window.location.href.indexOf('http') == -1)
          if (json_data_request.responseText !== "null")
          {
            JSONToCSVConvertor([json_data_request.responseText]);
          }
    };
    json_data_request.open('GET', "https://mvhs-fitness-tracker.firebaseio.com/.json", true);
    json_data_request.send(null);

    document.getElementById('times').innerHTML = "";
    // End Project specific code

    render();
  }

  function update() {
    clock += delta();
    if((clock/1000).toFixed(0) >= 60)
    {
      minutes++;
      clock = 0;
    }
    render();
  }

  function render() {
    if((clock/1000).toFixed(0) < 10)
    {
      timer.innerHTML = minutes + ":" + "0" + (clock/1000).toFixed(0);
      return;
    }

    timer.innerHTML = minutes + ":" + (clock/1000).toFixed(0);
  }

  function delta() {
    var now = Date.now(),
        d   = now - offset;

    offset = now;
    return d;
  }

  function getTime() {
    var time = document.getElementsByClassName('stopwatch_time')[0];
    return time.innerHTML;
  }

  // public API
  this.start  = start;
  this.stop   = stop;
  this.reset  = reset;
  this.getTime = getTime;
};

function JSONToCSVConvertor(JSONData) {   

  //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
  var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
  console.log(arrData);
  var CSV = '';
  //1st loop is to extract each row
  for (var i = 0; i < arrData.length; i++) {
      var row = "";
      // Data of all the students
      var run_data = JSON.parse(arrData[i]);
      // Array of all id numbers
      var student_id_array = Object.keys(run_data);

      for (var j = 0; j <= student_id_array.length-1; j++) {
        row += '"' + student_id_array[j] + '",' + '"' + run_data[student_id_array[j]].time + '",';
        //add a line break after each row
        CSV += row + '\r\n';
        row = "";
      };
  }

  if (CSV == '') {        
      alert("Invalid data");
      return;
  }   
    
  //this trick will generate a temp "a" tag
  var link = document.createElement("a");    
  link.id="lnkDwnldLnk";

  //this part will append the anchor tag and remove it after automatic click
  document.body.appendChild(link);

  var csv = CSV;  
  blob = new Blob([csv], { type: 'text/csv' }); 
  var csvUrl = window.webkitURL.createObjectURL(blob);
  var filename = 'UserExport.csv';
  document.getElementById('lnkDwnldLnk').download = filename;
  document.getElementById('lnkDwnldLnk').href = csvUrl;

  document.getElementById('lnkDwnldLnk').click();    
  document.body.removeChild(link);
  fb.remove();  
};

var elem = document.getElementById('stopwatch');

var stopwatch = new Stopwatch(elem, {delay:1000});

document.getElementById('student_id_input').addEventListener('keyup', function (event) {
  
  count++;
  console.log(count);
  if(count < 9)
    return;

  fb.child(document.getElementById('student_id_input').value).set({
    time: stopwatch.getTime()
  });

  document.getElementById('student_id_input').value = "";
  count = 0;
});

fb.on('value', function (run_data) {
  run_data.forEach(function (student) {
    
    var student_id = student.key();
    var student_time = student.val().time;
    var student_row = document.createElement('tr');
    student_row.innerHTML = "<td class='student_id' id='" + student_id + "'>" + student_id + "</td>";
    student_row.innerHTML += "<td class='student_time' id='" + student_id + "_time'>" + student_time + "</td>";
    var student_list = document.getElementsByClassName('student_id');

    if(!document.getElementById(student_id))
      document.getElementById("times").appendChild(student_row);
    else
      document.getElementById(student_id + "_time").innerHTML = student_time;

  });
});