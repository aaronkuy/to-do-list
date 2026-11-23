'use strict';

const todoForm = document.querySelector('form');
const todoInput = document.getElementById('write-input');
const todoListUL = document.getElementById('list');
const todoTemplate = document.getElementById('todo-template');

// In-memory state: [{ id, text, completed }]. The id is not stored. It only
// ties a list item to its task for this page view, so handlers do not depend
// on the position in the array.
let allTodos = [];
let nextId = 1;

// Handle submit (button or Enter) without the default page reload.
todoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addTodo();
});

// One listener each on the list instead of two per item.
todoListUL.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="checkbox"]')) return;
    const todo = findTodo(event.target.closest('.to-do'));
    if (!todo) return;
    todo.completed = event.target.checked;
    saveTodos();
});

todoListUL.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.delete-btn');
    if (deleteButton) deleteTodoItem(deleteButton.closest('.to-do'));
});

allTodos = getTodos().map(withId);
todoListUL.replaceChildren(...allTodos.map(createTodoItem));

function withId(todo) {
    return { id: String(nextId++), text: todo.text, completed: todo.completed };
}

function findTodo(todoLI) {
    return allTodos.find((todo) => todo.id === todoLI.dataset.id);
}

function addTodo() {
    const todoText = todoInput.value.trim();
    // Ignore empty or whitespace-only input.
    if (todoText.length === 0) return;

    const todo = withId({ text: todoText, completed: false });
    allTodos.push(todo);
    todoListUL.append(createTodoItem(todo));
    saveTodos();

    todoInput.value = '';
    // After a click on "ADD" the focus sits on the button; move it back so
    // the next task can be typed right away.
    todoInput.focus();
}

/** Builds the <li> for one task from the template in index.html. */
function createTodoItem(todo) {
    const todoLI = todoTemplate.content.firstElementChild.cloneNode(true);
    todoLI.dataset.id = todo.id;

    // The element id links both labels to the checkbox.
    const checkboxId = `todo-${todo.id}`;
    const checkbox = todoLI.querySelector('input');
    checkbox.id = checkboxId;
    checkbox.checked = todo.completed;
    for (const label of todoLI.querySelectorAll('label')) {
        label.htmlFor = checkboxId;
    }

    // textContent, not innerHTML: the text is user input and must stay text.
    todoLI.querySelector('.to-do-text').textContent = todo.text;
    // The button shows only an icon, so it needs a name for screen readers.
    todoLI
        .querySelector('.delete-btn')
        .setAttribute('aria-label', `Delete "${todo.text}"`);

    return todoLI;
}

function deleteTodoItem(todoLI) {
    // Removing the focused button would drop the focus to <body>. Pick the
    // neighbour before the item is gone.
    const neighbour = todoLI.nextElementSibling || todoLI.previousElementSibling;
    const focusTarget = neighbour ? neighbour.querySelector('input') : todoInput;

    allTodos = allTodos.filter((todo) => todo.id !== todoLI.dataset.id);
    todoLI.remove();
    saveTodos();
    focusTarget.focus();
}

// localStorage stores strings only, hence JSON. The ids are not stored.
function saveTodos() {
    const plain = allTodos.map((todo) => ({
        text: todo.text,
        completed: todo.completed,
    }));
    localStorage.setItem('todos', JSON.stringify(plain));
}

function getTodos() {
    const todos = localStorage.getItem('todos') || '[]';
    return JSON.parse(todos);
}
