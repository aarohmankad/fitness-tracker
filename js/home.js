var fb;

document.getElementById('teacher-input').addEventListener('keyup', function (e) {
	if(e.which != 13)
		return
	fb = new Firebase("https://mvhs-fitness-tracker.firebaseio.com/" + document.getElementById('teacher-input').value);

	window.location.href = 'timer.html';
});