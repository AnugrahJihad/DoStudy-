document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("beforeunload", function(e) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    });

    const studyTimeInput = document.getElementById("studyTime");
    const breakTimeInput = document.getElementById("breakTime");
    const startPomodoroButton = document.getElementById("startPomodoro");
    const pauseResumeButton = document.getElementById("pauseResumePomodoro");
    const resetButton = document.getElementById("resetPomodoro");
    const timerDisplay = document.getElementById("timerDisplay");
    const timerState = document.getElementById("timerState");

    const popupOverlay = document.getElementById("popupOverlay");
    const popupCancel = document.getElementById("popupCancel");
    const popupContinue = document.getElementById("popupContinue");

    const todoInput = document.getElementById("taskInput");
    const todoButton = document.getElementById("addTaskButton");
    const todoList = document.getElementById("taskList");

    let timerInterval;
    let isStudySession = true;
    let isPaused = false;
    let timeRemaining;

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function startTimer(duration, isStudy) {
        timeRemaining = duration * 60;
        updateTimerDisplay();
        timerState.textContent = isStudy ? "Waktunya belajar!" : "Waktunya istirahat!";
        isPaused = false;
        pauseResumeButton.disabled = false;
        pauseResumeButton.textContent = "Pause";
        resetButton.disabled = false;

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!isPaused) {
                timeRemaining--;
                updateTimerDisplay();

                if (timeRemaining < 0) {
                    clearInterval(timerInterval);
                    isStudySession = !isStudySession;
                    startTimer(
                        isStudySession ? parseInt(studyTimeInput.value, 10) : parseInt(breakTimeInput.value, 10),
                        isStudySession
                    );
                }
            }
        }, 1000);
    }

    function pauseResumeTimer() {
        if (isPaused) {
            isPaused = false;
            pauseResumeButton.textContent = "Pause";
        } else {
            isPaused = true;
            pauseResumeButton.textContent = "Resume";
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerDisplay.textContent = "00:00";
        timerState.textContent = "Siap untuk belajar!";
        isPaused = false;
        pauseResumeButton.textContent = "Pause";
        pauseResumeButton.disabled = true;
        resetButton.disabled = true;
    }

    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function createTodoElement(todo) {
        const todoItem = document.createElement("div");
        todoItem.classList.add("task-item");
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.completed;
        checkbox.addEventListener("change", function() {
            todo.completed = this.checked;
            taskSpan.style.textDecoration = this.checked ? "line-through" : "none";
            saveTodos();
        });

        const taskSpan = document.createElement("span");
        taskSpan.textContent = todo.text;
        if (todo.completed) {
            taskSpan.style.textDecoration = "line-through";
        }

        const categorySelect = document.createElement("select");
        categorySelect.classList.add("task-category");
        categorySelect.style.color = 'white';
        ["Study", "Homework", "Project", "Other"].forEach(category => {
            const option = document.createElement("option");
            option.value = category.toLowerCase();
            option.textContent = category;
            if (todo.category === category.toLowerCase()) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
        categorySelect.addEventListener("change", function() {
            todo.category = this.value;
            saveTodos();
        });

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "🗑️";
        deleteButton.addEventListener("click", function() {
            todoList.removeChild(todoItem);
            todos = todos.filter(t => t !== todo);
            saveTodos();
        });

        todoItem.appendChild(checkbox);
        todoItem.appendChild(taskSpan);
        todoItem.appendChild(categorySelect);
        todoItem.appendChild(deleteButton);

        return todoItem;
    }

    function loadTodos() {
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const todoItem = createTodoElement(todo);
            todoList.appendChild(todoItem);
        });
    }

    function addTodo() {
        const taskText = todoInput.value.trim();
        if (taskText !== "") {
            const todo = {
                text: taskText,
                completed: false,
                category: "study",
                created: new Date().toISOString()
            };
            
            todos.push(todo);
            const todoItem = createTodoElement(todo);
            todoList.appendChild(todoItem);
            todoInput.value = "";
            todoButton.disabled = true;
            saveTodos();
        }
    }

    startPomodoroButton.addEventListener("click", function () {
        const studyTime = parseInt(studyTimeInput.value, 10);
        const breakTime = parseInt(breakTimeInput.value, 10);

        if (breakTime > studyTime) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "00:00";
            timerState.textContent = "Siap untuk belajar!";
            popupOverlay.style.display = "flex";
        } else {
            startTimer(studyTime, true);
        }
    });

    popupCancel.addEventListener("click", function () {
        popupOverlay.style.display = "none";
    });
    
    popupContinue.addEventListener("click", function () {
        popupOverlay.style.display = "none";
        const studyTime = parseInt(studyTimeInput.value, 10);
        startTimer(studyTime, true);
    });

    pauseResumeButton.addEventListener("click", pauseResumeTimer);
    resetButton.addEventListener("click", resetTimer);

    todoInput.addEventListener("input", function() {
        todoButton.disabled = this.value.trim() === "";
    });

    todoButton.addEventListener("click", addTodo);

    todoInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && this.value.trim() !== "") {
            addTodo();
        }
    });

    loadTodos();
});