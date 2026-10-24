const STORAGE_KEY = "daylight-todos";
let todos = loadTodos();
let currentFilter = "all";

const todoForm = document.querySelector("#todoForm");
const todoInput = document.querySelector("#todoInput");
const todoList = document.querySelector("#todoList");
const emptyState = document.querySelector("#emptyState");

document.querySelector("#dateDisplay").textContent = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date());

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  todos.unshift({ id, title, completed: false });
  todoInput.value = "";
  saveAndRender();
});

document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
  currentFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach((item) => item.classList.toggle("active", item === button));
  render();
}));

document.querySelector("#clearCompleted").addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveAndRender();
});

function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(savedTodos)) return [];
    return savedTodos.filter((todo) => todo && typeof todo.id === "string" && typeof todo.title === "string" && typeof todo.completed === "boolean");
  }
  catch { return []; }
}

function saveAndRender() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // The app can still be used for the current page session if storage is unavailable.
  }
  render();
}

function render() {
  const visibleTodos = todos.filter((todo) => currentFilter === "all" || (currentFilter === "active" && !todo.completed) || (currentFilter === "completed" && todo.completed));
  todoList.replaceChildren(...visibleTodos.map(createTodoElement));
  emptyState.hidden = visibleTodos.length > 0;
  if (visibleTodos.length === 0) {
    document.querySelector("#emptyTitle").textContent = currentFilter === "completed" ? "Nothing completed yet." : currentFilter === "active" ? "You’re all caught up." : "Your list is clear.";
    document.querySelector("#emptyText").textContent = currentFilter === "all" ? "Add a small step and make today count." : "A clean slate is a good place to start.";
  }
  const completed = todos.filter((todo) => todo.completed).length;
  document.querySelector("#allCount").textContent = todos.length;
  document.querySelector("#activeCount").textContent = todos.length - completed;
  document.querySelector("#completedCount").textContent = completed;
  const progress = todos.length ? Math.round((completed / todos.length) * 100) : 0;
  document.querySelector("#progressText").textContent = `${progress}%`;
  document.querySelector("#progressBar").style.width = `${progress}%`;
}

function createTodoElement(todo) {
  const item = document.createElement("li");
  item.className = `todo-item${todo.completed ? " completed" : ""}`;
  const check = document.createElement("button");
  check.className = `check${todo.completed ? " checked" : ""}`;
  check.type = "button";
  check.setAttribute("aria-label", todo.completed ? `Mark ${todo.title} as open` : `Complete ${todo.title}`);
  check.addEventListener("click", () => { todo.completed = !todo.completed; saveAndRender(); });
  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.title;
  const remove = document.createElement("button");
  remove.className = "delete";
  remove.type = "button";
  remove.setAttribute("aria-label", `Delete ${todo.title}`);
  remove.textContent = "×";
  remove.addEventListener("click", () => { todos = todos.filter((entry) => entry.id !== todo.id); saveAndRender(); });
  item.append(check, text, remove);
  return item;
}

render();
