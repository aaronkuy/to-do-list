const todoForm = document.querySelector('form');
const todoInput = document.getElementById('write-input');
const todoListUL = document.getElementById('list');
const todoTemplate = document.getElementById('todo-template');

// In-memory state. Reassigned in deleteTodoItem(), hence `let`.
let allTodos = getTodos();
updateTodoList();

// Handle submit (button or Enter) without the default page reload.
todoForm.addEventListener('submit', function(e){
    e.preventDefault();
    addTodo();
})


function addTodo() {
    const todoText = todoInput.value.trim();
    // Ignore empty or whitespace-only input.
    if(todoText.length === 0) return;
    const todoObject = {
        text: todoText,
        completed: false
    }
    allTodos.push(todoObject);
    updateTodoList();
    saveTodos();
    todoInput.value = '';

    }

    function updateTodoList(){
    todoListUL.replaceChildren();
    allTodos.forEach((todo, todoIndex)=>{
        const todoItem = createTodoItem(todo, todoIndex);
        todoListUL.append(todoItem);
    })
}



function createTodoItem(todo, todoIndex){
    // The id links both labels to the checkbox.
    const todoId = "todo-"+todoIndex;
    const todoLI = todoTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = todoLI.querySelector("input");
    checkbox.id = todoId;
    checkbox.checked = todo.completed;
    todoLI.querySelectorAll("label").forEach((label)=>{
        label.htmlFor = todoId;
    });
    // textContent, not innerHTML: the text is user input and must stay text.
    todoLI.querySelector(".to-do-text").textContent = todo.text;

    const deleteButton = todoLI.querySelector(".delete-btn");
    // The button shows only an icon, so it needs a name for screen readers.
    deleteButton.setAttribute("aria-label", `Delete "${todo.text}"`);
    deleteButton.addEventListener('click', ()=>{
        deleteTodoItem(todoIndex);
    })
    checkbox.addEventListener('change', ()=>{
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
    })
    return todoLI;
}


function deleteTodoItem(todoIndex){
    allTodos = allTodos.filter((_, i)=> i !== todoIndex);
    saveTodos();
    updateTodoList();
}


// localStorage stores strings only, hence JSON.
function saveTodos(){
    const todosJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todosJson);

}



function getTodos() {
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}
