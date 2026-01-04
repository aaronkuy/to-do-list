//Fetch the HTML elements 
const todoForm = document.querySelector('form');
const todoInput = document.getElementById('write-input');
const todoListUL = document.getElementById('list');

//Allocat the local storage array to 'let allTodos' because the list changes
//when the user deletes or rewrite new entries, then update our list 
let allTodos = getTodos();
updateTodoList();

//Prevents the reload of the website, if the user clicks on Add or on enter
//nevertheless the input will still be saved in the DOM 
todoForm.addEventListener('submit', function(e){
    e.preventDefault();
    addTodo();
})


//Save the enterd input and erase unnecessay spaces for UX
function addTodo() {
    const todoText = todoInput.value.trim();
//If the user didn't typed something inside the input field, skipp the code beneath
    if(todoText.length === 0) return;
//Create a dictionary for our entry in the to do list, start value of completed is false
    const todoObject = {
        text: todoText,
        completed: false
    }
//Insert the todoObject to the array, then update the list and save it, after 
//empty the input field for new entries 
    allTodos.push(todoObject);
    updateTodoList();
    saveTodos();
    todoInput.value = '';

    }

//Empty our unordered list in HTML
    function updateTodoList(){
    todoListUL.innerHTML = '';
//Placeholder todo for the entry dictionary and todoIndex for the postition, e.g. 0 or 1
    allTodos.forEach((todo, todoIndex)=>{
//Allocate the finished entry after it got parsed in the createTodoItem to todoItem
        todoItem = createTodoItem(todo, todoIndex);
//Then display it in the DOM 
        todoListUL.append(todoItem);
    })
}



//Erect the the right formation of the entry for the DOM 
function createTodoItem(todo, todoIndex){
//Numerate every entry for UX when the user want to adjust his list 
    const todoId = "todo-"+todoIndex;
//Create a new li container for the entry in HTML 
    const todoLI =document.createElement('li');
//Extract only the users text of the dictionary and saved it to todoText
    const todoText = todo.text;
//Li gets the class name "to-do" in order to style it with CSS 
    todoLI.className = "to-do";
//Backtick to also implement variables in it, our HTML element of the entry 
    todoLI.innerHTML = `
         <input type="checkbox" id="${todoId}">
         <label class="custom-checkbox" for="${todoId}">
<! -- This svg is the checkmark symbol  --> 
              <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24px"
                     viewBox="0 -960 960 960"
                     width="24px"
                    fill="#e3e3e3"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
               </svg>
         </label>
         <label for="${todoId}" class="to-do-text">
               ${todoText}
         </label>
         <button class="delete-btn">
<! -- This svg is the delete symbol -->
             <svg fill="var(--secondary-color)"
              xmlns="http://www.w3.org/2000/svg" height="24px" 
              viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
              </svg>
         </button>
        `
//When the user is clicking the specific delete button in the entry execute 
//the deleteTodoItem function with todoIndex as a parameter
    const deleteButton = todoLI.querySelector(".delete-btn");
    deleteButton.addEventListener('click', ()=>{
        deleteTodoItem(todoIndex);
    })
//Saving the first input in li to checkbox which is the checkmark
    const checkbox = todoLI.querySelector("input");
//If checkbox being checked than execute saveTodos function to update it
    checkbox.addEventListener('change', ()=>{
//If true set the object completed in the dictionary to true, else false,
//save it in the local storage
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
    })
//Set the state of checkbox in the DOM and return it 
    checkbox.checked = todo.completed;
    return todoLI;
}


//Function to delete entries
function deleteTodoItem(todoIndex){
//Create a new array what doesn't entail an dictionary with the selected index
    allTodos = allTodos.filter((_, i)=> i !== todoIndex);
//Save it in the local storage when the user reload the page
    saveTodos();
//Revise the DOM 
    updateTodoList();
}


//Convert it, due the local storage only can save strings 
//and allocate it to todosJson
function saveTodos(){
    const todosJson = JSON.stringify(allTodos);
//Save the string to the key 'todos' in the localstorage
    localStorage.setItem("todos", todosJson);

}



//Allocate everything inside the local storage under the key "todos" to the
//variable todos, then converts it to an array in order to work with it again 
function getTodos() {
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}
