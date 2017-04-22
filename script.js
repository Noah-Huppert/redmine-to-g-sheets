var tasksURL = "https://gist.githubusercontent.com/Noah-Huppert/e56e01bad1188f62ecf85e8fa5d57021/raw/62f426aa63a94da9e1cbba765131d0d1b86edce6/issues.csv";
var _tasksData = undefined;
var _tasksDataLoadURL = undefined;

function loadTasksData() {
  var tasksURLContent = UrlFetchApp.fetch(tasksURL).getContentText();
  _tasksData = csv.decode(tasksURLContent);
  _tasksDataLoadURL = tasksURL;
}

function getTasksData() {
  if (_tasksData === undefined || tasksURL !== _tasksDataLoadURL) {
    loadTasksData();
  }

  return _tasksData;
}

var COL_ID = "#";
var COL_PARENT_TASK = "Parent task";

function taskList() {
  var tasks = {};

  // Parse CSV tasks
  var data = getTasksData();
  for(var i = 0; i < data.length; i++) {
    var task = {};

    // Basic info
    var id = taskData[COL_ID];
    var parentId = taskData[COL_PARENT_TASK];

    task.id = id;

    // If parent task
    if (parentId === undefined) {
      // Set parent attrs
      task.children = [];
      task.parent = true;

      // Add task
      tasks[id] = task;
    } else {// If child task
      task.parent = false;

      // If Parent doesn't exist yet
      if ((parentId in tasks) === false) {
        // Add temp
        tasks[parentId] = {id: parentId, parent: true, children: []};
      }

      // Added id to parent
      tasks[parentId].children.push(id);

      // Add task
      tasks[id] = task;
    }
  }

  // Display
  var out = [];

  for (var task in tasks) {
    out.push([task.id, task.parent]);
  }

  return out;
}
