$(document).ready(function() {
	var map;

	// check if we have any data in the localStorage
	var data = JSON.parse(localStorage.getItem("todo")); // convert string into JSON object

	// when accessing for the first time, localStorage is null, so initialize data
	if(data == null) {
		data = {
			"items":[],
		}
	}
	// else upload content already stored in localStorage
	else { 
		for(var i = 0; i<data.items.length; i++) {
			var task = prependTask(data.items[i].name,data.items[i].date,data.items[i].isDone,data.items[i].color);
			$(".todo").prepend(task);
			$(".sub").hide();
		}
	}

	// loop through each list and load image depending on whether id is marked as done or not-done
	$(".name").each(function() {
		if($(this).attr("id") == "not-done") {
			$(this).siblings("i").attr("class", "fa fa-square-o fa-2x");
		}
		else if($(this).attr("id") == "done") {
			$(this).siblings("i").attr("class", "fa fa-check-square-o fa-2x");
		}
	});

	// when add button is clicked
	$("#add").click(function() {
		// store user input values
		var name = getInputName();
		// if input value for new task is empty, don't do anything
		if(name == "") {
			return false;
		}

		var date = getInputDate();
		var color = getInputColor();

		// push new task to data object
		data.items.push({"name":name,"date":date,"isDone":"not-done","color":color});

		// store new item in localStorage
		localStorage.setItem("todo", JSON.stringify(data)); // convert JavaScript value to a JSON string
		var task = prependTask(name,date,"not-done",color);

		$(".todo").prepend(task); // prepend new task
		$(".sub").hide(); // subcontent is initially hidden
		$(".form")[0].reset(); // reset the form after adding new task

		// prevent form submission
		return false;
	});

	// mark as done
	$(".todo").on("click", "#check", function() {
		data = JSON.parse(localStorage.getItem("todo"));

		// change id from not-done to done
		if($(this).siblings(".name").attr("id") == "not-done") {
			$(this).siblings(".name").attr("id", "done");
			$(this).attr("class", "fa fa-check-square-o fa-2x");

			var currentTask = $(this).siblings(".name").text();
			for(var i = 0; i<data.items.length; i++) {
				if(data.items[i].name == currentTask) {
					data.items[i].isDone = "done";
				}
			}
		}
		else if($(this).siblings(".name").attr("id") == "done") {
			$(this).siblings(".name").attr("id", "not-done");
			$(this).attr("class", "fa fa-square-o fa-2x");

			var currentTask = $(this).siblings(".name").text();
			for(var i = 0; i<data.items.length; i++) {
				if(data.items[i].name == currentTask) {
					data.items[i].isDone = "not-done";
				}
			}
		}

		// save changes to localStorage
		localStorage.setItem("todo", JSON.stringify(data));
	});

	// show subcontent
	$(".todo").on("click", ".name", function() {
		$(this).siblings(".sub").toggle("fast");
	});

	// swipe list left to delete
	$(".todo").on("swipeleft", ".new-task", function() {
		// check if already swiped left
		if($(this).css("margin-left") == "-40px") {
			return false;
		}
		else {
			$(this).css("margin-left", "-40px");
			$(this).children("span").after("<span style='cursor:pointer' class='delete'>delete</span>");
		}
	});

	// swipe right to remove delete button
	$(".todo").on("swiperight", ".new-task", function() {
		// check if already swiped left
		if($(this).css("margin-left") == "-40px") {
			$(this).css("margin-left", "0px");
			$(this).children(".delete").remove();
		}
		else {
			return false;
		}
	});

	// on delete
	$(".todo").on("click", ".delete", function() {
		// add fade out effect
		$(this).parent().fadeOut(400, function() {
			$(this).remove();
		});

		// remove from localStorage
		data = JSON.parse(localStorage.getItem("todo"));
		var currentTask = $(this).siblings(".name").text();
		for(var i = 0; i<data.items.length; i++) {
			if(data.items[i].name == currentTask) {
				data.items.splice(i, 1);
			}
		}

		// save changes to localStorage
		localStorage.setItem("todo", JSON.stringify(data));
	});

	function prependTask(name, date, isDone, color) {
		var newTask = 
		"<li class='new-task'>"+
			"<i class='fa fa-square-o fa-lg fa-2x' id='check'></i>"+
			"&nbsp;&nbsp;&nbsp;<span style='color:"+color+"' class='name' id='"+isDone+"'>"+name+"</span>"+
			"<ul class='sub'>"+
				"<li>"+
					"Due date: "+date+
				"</li>"+
			"</ul>"+
		"</li>";

		return newTask;
	}

	function dateNow() {
		d = new Date();

		day = d.getDate();
		if(day<10) {
			day = "0"+d.getDate();
		}

		month = d.getMonth()+1;
		if(month<10) {
			month = "0"+(d.getMonth()+1);
		}

		date = d.getFullYear()+"-"+month+"-"+day;

		return date;
	}

	function getInputName() {
		var name = $("#name").val();

		return name.toLowerCase();
	}

	function getInputDate() {
		var date = $("#date").val();

		// if date is empty, enter today's date
		if(date == "") {
			date = dateNow();
		}

		return date;
	}

	function getInputColor() {
		var color = $("#item_color").val();

		return color;
	}

	// // clear localStorage
	// $(".clear").click(function() {
	// 	localStorage.clear();
	// });

	// google maps API
	function initialize() {
		var mapOptions = {
			zoom:16
		}

		map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				
				var infoWindow = new google.maps.InfoWindow({
					map:map,
					position:pos,
					content:"You are here"
				});

				map.setCenter(pos);
			}, function() {
				handleNoGeolocation(true);
			});
		}
		else {
			// browser doesn't support geolocation
			handleNoGeolocation(false);
		}
	}

	function handleNoGeolocation(error) {
		if(error) {
			var content = "Error: The Geolocation service failed.";
		}
		else {
			var content = "Error: Your browser doesn't support geolocation.";
		}

		var options = {
			map:map,
			position:new google.maps.LatLng(60.1708,24.9375),
			content:content
		};

		var infowindow = new google.maps.InfoWindow(options);
		map.setCenter(options.position);
	}

	google.maps.event.addDomListener(window, "load", initialize);
});