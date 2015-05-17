

var fb = new Firebase('http://mvhs-fitness-tracker.firebaseio.com')



var Stopwatch = function(elem, options) {

  
  var timer       = createTimer(),
      
      startButton = createButton("start", start),
      stopButton  = createButton("stop", stop),
      resetButton = createButton("reset", reset),

      
      offset,
      clock,
      minutes,
      interval;

  
  options = options || {};
  
  options.delay = options.delay || 1;

  
  elem.appendChild(timer);
  elem.appendChild(startButton);
  elem.appendChild(stopButton);
  elem.appendChild(resetButton);

  
  init();

  
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

    
    var request = new XMLHttpRequest();

    
    request.open('GET', "https://mvhs-fitness-tracker.firebaseio.com/.json", true);
    
    request.onload = function () {
      if(request.readyState == 4)
        if(request.status >= 200 && request.status < 400)
          if (request.responseText !== "null")
          {
            
            JSONToCSVConvertor([request.responseText]);
          }
    };

    request.onerror = function () {
      console.log(request.statusText);
    }

    request.send();

    
    document.getElementById('times').innerHTML = "";
    
    document.getElementById('student_id_input').value = "";
    
    render();
  }

  function init () {
    clock = 0;
    minutes = 0;
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

  
  this.start  = start;
  this.stop   = stop;
  this.reset  = reset;
  this.getTime = getTime;
};



function JSONToCSVConvertor(JSONData) {   

  //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
  var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
  var CSV = '';
  //1st loop is to extract all of the data from array
  for (var i = 0; i < Object.keys(arrData).length; i++) {
      
      var row = '';
      
      var run_data = JSON.parse(arrData[i]);
      
      var teachers = Object.keys(run_data);
      console.log(teachers);
      
      var this_teacher = document.getElementById('teacher_id_input').value;
      
      for(var i = 0; i < teachers.length; i++)
      {
        
        if(teachers[i] == this_teacher)
          this_teacher = i;
      }
      
      var teacher_data = run_data[teachers[this_teacher]];

      
      var student_ids = Object.keys(teacher_data);
      
      for(var i = 0; i < student_ids.length; i++)
      {
        var student_id = student_ids[i];
        var student_time = teacher_data[student_id].time;
        
        row += '"' + student_id + '",' + '"' + student_time + '",';
        
        CSV += row + '\r\n';
        
        row = '';
      }

  }

  
  if (CSV == '') {        
      alert("Invalid data");
      return;
  }   
    
  //this trick will generate a temporary anchor tag
  var link = document.createElement("a");    
  link.id="lnkDwnldLnk";

  //this part will inject the anchor tag and remove it after automatic click
  document.body.appendChild(link);

  
  var csv = CSV;  
  blob = new Blob([csv], { type: 'text/csv' }); 
  var csvUrl = window.webkitURL.createObjectURL(blob);
  var filename = 'UserExport.csv';
  document.getElementById('lnkDwnldLnk').download = filename;
  document.getElementById('lnkDwnldLnk').href = csvUrl;

  document.getElementById('lnkDwnldLnk').click();    
  document.body.removeChild(link);

  
  fb.child(document.getElementById('teacher_id_input').value).remove();  
};




var elem = document.getElementById('stopwatch');



var stopwatch = new Stopwatch(elem, {delay:1000});



document.getElementById('student_id_input').addEventListener('keyup', function (event) {
  
  
  if(document.getElementById('student_id_input').value.length != 9)
    return;

  
  fb.child(document.getElementById('teacher_id_input').value).child(document.getElementById('student_id_input').value).set({
    
    time: stopwatch.getTime()
  });

  
  count = 0;
  
  document.getElementById('student_id_input').value = "";
  
  count = 0;
});

document.getElementById('teacher_id_input').addEventListener('keyup', function (event) {
 if(document.getElementById('teacher_id_input').value.length != 9)
    return;

  
  document.getElementById('teacher_id_input').className = 'hidden';
})


fb.on('value', function (run_data) {
  
  var teacher_data = run_data.val();
  if(teacher_data)
    var teachers = Object.keys(teacher_data);
  else
    return;
  var this_teacher = "/";
  for(teacher in teachers)
    if(teacher == document.getElementById('teacher_id_input').value)
      this_teacher = teacher;
  
  run_data.child(this_teacher).forEach(function (student_data) {
    document.getElementById("times").innerHTML = "";
    student_data.forEach(function (student){
      
      var student_id = student.key();
      
      var student_time = student.val().time;
      
      var student_row = document.createElement('tr');
      
      student_row.innerHTML = "<td class='student_id' id='" + student_id + "'>" + student_id + "</td>";
      
      student_row.innerHTML += "<td class='student_time' id='" + student_id + "_time'>" + student_time + "</td>";

      
      
      if(!document.getElementById(student_id))
        document.getElementById("times").appendChild(student_row);
      
      else
        document.getElementById(student_id + "_time").innerHTML = student_time;
    });

  });
});