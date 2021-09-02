var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    // console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// added by me 
// delegating clicks to the parent 'ul' with the class 'list-group', a click callback
$(".list-group").on("click", "p", function () {
  var text = $(this)
    .text() //method
    .trim(); // method

  // this will create a textarea html element
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  // this will replace the p element with a textarea element
  $(this).replaceWith(textInput);

  // highlighted/hovered element will be in "focus"
  textInput.trigger("focus");
});


// textarea will revert back when it goes out of focus so we can use this event instead of the "Save Button", a blur callback function.
$(".list-group").on("blur", "textarea", function () {
  // get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  // get parent ul's id attribute 
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of the other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // tasks is an object
  // tasks[status] returns an array (ex. toDo)
  // tasks[status][index] returns the object at the given index in the array
  // tasks[status][index].text returns the text property of the object and the given index 
  tasks[status][index].text = text;
  // calling the function
  saveTasks();

  // recreate p element 
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with p element (converting textarea into a p element)
  $(this).replaceWith(taskP);
});


// due date was clicked 
$(".list-group").on("click", "span", function () {
  //get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function () {
      // when calendar is closed, for a "change" event on the 'dateInput' 
      $(this).trigger("change");
    }
  });

  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// value of due date was changed 
// it will listen for a change in dates when we are editing 
$(".list-group").on("change", "input[type='text']", function () {
  // get current text 
  var date = $(this)
    .val()
    .trim();

  // get the parent's ul's id attribute 
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localStorage 
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with the bootstrap classes 
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element 
  $(this).replaceWith(taskSpan);

  // pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// this will make the tasks items draggable across different columns
// we use the sortable method, turns every class with the name list-group into a sortable list
// the connectWith will link the sortable lists with the same class
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone", // tell JQuery to create a copy from the original element to avoid click events from trigerring on the original element 
  activate: function (event) {
    console.log("activate", this); // activate is an event listener
  },
  deactivate: function (event) {
    console.log("deactivate", this);
  },
  over: function (event) {
    console.log("over", event.target); // over is an event listener
  },
  out: function (event) {
    console.log("out", event.target); // out is an event listener
  },
  update: function (event) {
    // declaring a new array before the loop starts 
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    // each method will run a callback function for every item/element in the array
    $(this).children().each(function () {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
    // below we are saving the drag tasks items once they are moved and the page is refreshed
    // trim down list's ID to match object property 
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");
    // update array on task object and save
    tasks[arrName] = tempArr;
    saveTasks();

    console.log(tempArr);
  }
});


// deleting a task item
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  // the drop method means the user is triying to delete a task
  drop: function (event, ui) {
    // this makes the item draggable and remove it entirely
    ui.draggable.remove();
    console.log("drop");
  },
  over: function (event, ui) {
    console.log("over");
  },
  out: function (event, ui) {
    console.log("out");
  }
});

// date picker modal 
$("#modalDueDate").datepicker({
  // here we are setting the minimun date to be 1 day from the current date so users do not click a due date that has already past
  minDate: 1
});


var auditTask = function (taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-danger");

  // apply new class if task is near/over due date
  // query method
  // we added a bootstrap class to turn the task item red if it's past due
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  // adding an else if statement to turn task item yellow with a bootstrap class, if it's within 2 days from due date
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};
// end by me 

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


