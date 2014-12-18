// Search in order of how everything is stepped through. There are steps 1-

// Initialize the fb variable as our database object.
// All changes made to the database are made through this fb object.
var fb = new Firebase("https://mvhs-fitness-tracker.firebaseio.com/");

// Counts the digits of an id, to prevent fraud with fake id's
var count = 0;

// Create a Stopwatch class
// elem is our stopwatch element, referred to by the stopwatch id in our .html file
// options is an optional variable you can pass in
var Stopwatch = function(elem, options) {

  // timer is an HTML element that is injected into our .html file
  var timer       = createTimer(),
      // Start, Stop, and Reset buttons are instantiated
      startButton = createButton("start", start),
      stopButton  = createButton("stop", stop),
      resetButton = createButton("reset", reset),

      // These are variable to ensure accuracy with timing.
      offset,
      clock,
      minutes,
      interval;

  // Options can be passed through to alter behaviour of clock
  options = options || {};
  // options.delay refers to how often to update the timer in milliseconds
  options.delay = options.delay || 1;

  // append timer and buttons to our html element (stopwatch id)
  elem.appendChild(timer);
  elem.appendChild(startButton);
  elem.appendChild(stopButton);
  elem.appendChild(resetButton);

  // initialize
  reset();

  // create initial template for timer
  function createTimer() {
    var timer = document.createElement("div");
    timer.className = "stopwatch_time";
    return timer;
  }

  // Function to create buttons on timer
  // action is what the button says
  // handler is the name of the function that is called when the button is pressed
  function createButton(action, handler) {
    // Create a button template
    var btn = document.createElement("button");

    // Add some styles (btn, btn-block) and a referring name (stopwatch_"action")
    btn.className = "btn" + " btn-block" + " stopwatch_" + action;

    // Change color of the button depending on action
    if(action == "start")
      // Green button
      btn.className = btn.className + " btn-success";
    if(action == "stop")
      // Red button
      btn.className = btn.className + " btn-danger";
    if(action == "reset")
      // Orange Button
      btn.className = btn.className + " btn-warning";

    // Set content of the button
    btn.innerHTML = action;

    // Listen for a click on the button
    btn.addEventListener("click", function(event) {
      // Call the function that is related to the button, or whatever is passed in as handler
      handler();
      // To stop wierd screen glitches
      event.preventDefault();
    });
    return btn;
  }

  // Start the timer
  function start() {
    if (!interval) {
      offset   = Date.now();
      interval = setInterval(update, options.delay);
    }

    // Once start is pressed, autofocus on the input element
    document.getElementById("student_id_input").focus();
  }

  // Stop the timer
  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  // Reset the timer
  function reset() {
    clock = 0;
    minutes = 0;

    // Set up databse data query function
    var json_data_request = new XMLHttpRequest();
    json_data_request.onreadystatechange = function () {
      if(json_data_request.readyState == 4)
        if(json_data_request.status == 200 || window.location.href.indexOf('http') == -1)
          if (json_data_request.responseText !== "null")
          {
            // Send database data to get it converted to Excel
            // Must pass in an array
            JSONToCSVConvertor([json_data_request.responseText]);
          }
    };
    // Actually call the data
    json_data_request.open('GET', "https://mvhs-fitness-tracker.firebaseio.com/.json", true);
    json_data_request.send(null);

    // Clear the table of id's and times
    document.getElementById('times').innerHTML = "";

    // Push the updates visually
    render();
  }

  // Update is called continuously
  function update() {
    clock += delta();
    if((clock/1000).toFixed(0) >= 60)
    {
      minutes++;
      clock = 0;
    }
    render();
  }

  // Push any changes visually
  function render() {
    if((clock/1000).toFixed(0) < 10)
    {
      timer.innerHTML = minutes + ":" + "0" + (clock/1000).toFixed(0);
      return;
    }

    timer.innerHTML = minutes + ":" + (clock/1000).toFixed(0);
  }

  // Checks for accurate time management
  function delta() {
    var now = Date.now(),
        d   = now - offset;

    offset = now;
    return d;
  }

  // Accessor method to get time of the stopwatch
  function getTime() {
    var time = document.getElementsByClassName('stopwatch_time')[0];
    return time.innerHTML;
  }

  // Public function variables to protect actual private functions
  this.start  = start;
  this.stop   = stop;
  this.reset  = reset;
  this.getTime = getTime;
};

// Converts JSON to CSV, to allow an excel sheet download
// JSONData is an array with one item, an object of all the data
function JSONToCSVConvertor(JSONData) {   

  //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
  var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
  var CSV = '';
  //1st loop is to extract all of the data from array
  for (var i = 0; i < arrData.length; i++) {
      // Initialize an excel sheet row
      var row = "";
      // Data of all the students
      var run_data = JSON.parse(arrData[i]);
      // Array of all id numbers
      var student_id_array = Object.keys(run_data);

      // Loop through all students
      for (var j = 0; j <= student_id_array.length-1; j++) {
        // Add ID of the student in the first column, time in the second column
        row += '"' + student_id_array[j] + '",' + '"' + run_data[student_id_array[j]].time + '",';
        //add a line break after each row
        CSV += row + '\r\n';
        // Initialize the next row
        row = "";
      };
  }

  // If the CSV hasn't been changed after any of the loops, return an error
  if (CSV == '') {        
      alert("Invalid data");
      return;
  }   
    
  //this trick will generate a temporary anchor tag
  var link = document.createElement("a");    
  link.id="lnkDwnldLnk";

  //this part will inject the anchor tag and remove it after automatic click
  document.body.appendChild(link);

  // Handle the downloading of the excel file
  var csv = CSV;  
  blob = new Blob([csv], { type: 'text/csv' }); 
  var csvUrl = window.webkitURL.createObjectURL(blob);
  var filename = 'UserExport.csv';
  document.getElementById('lnkDwnldLnk').download = filename;
  document.getElementById('lnkDwnldLnk').href = csvUrl;

  document.getElementById('lnkDwnldLnk').click();    
  document.body.removeChild(link);

  // Clear the database
  fb.remove();  
};


// The stopwatch in the .html is now referred to by elem.
// document.getElementById fetches an html element by referring to a unique id.
var elem = document.getElementById('stopwatch');

// Create an instance of the Stopwatch class
// elem is now updated every 1000 milliseconds
var stopwatch = new Stopwatch(elem, {delay:1000});

// This function is called everytime a key is pressed
// event is an object that carries data on what was pressed
document.getElementById('student_id_input').addEventListener('keyup', function (event) {
  
  // Add one to count for every number in the id
  count++;
  // If the entire id isn't typed, return
  if(count < 9)
    return;

  // our database has a child instance for every id number
  fb.child(document.getElementById('student_id_input').value).set({
    // Every id number has a time attribute, which we get from the stopwatch public methods
    time: stopwatch.getTime()
  });

  // Once we set a time for the student, clear the input box for the next id.
  document.getElementById('student_id_input').value = "";
  // Reset id counter
  count = 0;
});

// Function in called everytime our database is updated
fb.on('value', function (run_data) {
  // Loop through each student
  run_data.forEach(function (student) {
    
    // Student ID
    var student_id = student.key();
    // Student Time
    var student_time = student.val().time;
    // Create a row element for the student (will be pushed to .html file, not excel sheet)
    var student_row = document.createElement('tr');
    // The row will have student's id
    student_row.innerHTML = "<td class='student_id' id='" + student_id + "'>" + student_id + "</td>";
    // and student's time
    student_row.innerHTML += "<td class='student_time' id='" + student_id + "_time'>" + student_time + "</td>";

    // If there is no existing row for this student, push the element to the .html file.
    // row is pushed into the times table referred to by the unique id attribute, "times"
    if(!document.getElementById(student_id))
      document.getElementById("times").appendChild(student_row);
    // Else, inject the time into the student's row
    else
      document.getElementById(student_id + "_time").innerHTML = student_time;

  });
});