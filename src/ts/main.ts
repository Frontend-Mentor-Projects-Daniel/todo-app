// ------------------------------------------------------------------------------
//                                 DOM NODES
//-------------------------------------------------------------------------------
const todos = document.querySelectorAll(
  '.todo-list-item'
) as NodeListOf<HTMLLIElement>;
const form = document.querySelector('.create-bar-form') as HTMLFormElement;
const input = document.querySelector('.create-bar') as HTMLInputElement;
const ul = document.querySelector('.list') as HTMLUListElement;

// ------------------------------------------------------------------------------
//                                 TYPES
//-------------------------------------------------------------------------------
type Todo = {
  id: string;
  value: string;
};

type validButton = 'delete-btn';

// ------------------------------------------------------------------------------
//                                 MODEL
//-------------------------------------------------------------------------------
type Model = {
  AllTodos: Todo[];
};

// ------------------------------------------------------------------------------
//                               GLOBAL STATE
//-------------------------------------------------------------------------------
const init: Model = {
  AllTodos: [],
};
Object.freeze(init);

// ------------------------------------------------------------------------------
//                             UPDATE FUNCTION
//-------------------------------------------------------------------------------
type Msg = 'AddTodo' | 'RemoveTodo' | 'UpdateTodo' | 'ReadTodo';

function update(msg: Msg, model: Model, value: Todo): void {
  switch (msg) {
    case 'AddTodo':
      model.AllTodos.push(value);
      break;

    case 'RemoveTodo':
      model.AllTodos.forEach((todo) => {
        if (todo.id === value.id) {
          const index = model.AllTodos.indexOf(todo);
          model.AllTodos.splice(index, 1);
        }
      });
      break;

    case 'UpdateTodo':
      model.AllTodos.forEach((todo) => {
        if (todo.id === value.id) {
          const index = model.AllTodos.indexOf(todo);
          model.AllTodos[index].value = value.value;
        }
      });
      break;

    case 'ReadTodo':
      model.AllTodos.push(value);
      break;
  }
}

// ------------------------------------------------------------------------------
//                                   SCRIPTS
//-------------------------------------------------------------------------------

//* Get Todos from localStorage
((model: Model) => {
  const getStoredTodos: string = getItemsFromLocalStorage('todos');
  const parseStoredTodos: Todo[] = parseTodos(getStoredTodos);

  for (const todo of parseStoredTodos) {
    update('ReadTodo', model, todo);
  }

  renderTodos(model.AllTodos);
})(init);

//* Create New Todo
((model: Model) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const getUserInput = input.value.trim();
    const isUserInputEmpty = CheckIfEmptyString(getUserInput);
    const createNewTodo = createTodoObject(getUserInput);

    if (!isUserInputEmpty) {
      update('AddTodo', model, createNewTodo);
      saveToLocalStorage(model.AllTodos);
    }

    renderTodos(model.AllTodos);
  });
})(init);

//* Delete Todo
((model: Model) => {
  ul.addEventListener('click', (e) => {
    const xImage = e.target as HTMLImageElement;
    const button = xImage.parentElement as HTMLButtonElement;

    const li = button.parentElement as HTMLLIElement;

    const todoId = li.dataset.id as string;
    const isDeleteOrUpdateBtn = checkTypeOfButton(button);

    if (isDeleteOrUpdateBtn === 'delete-btn') {
      const todoThatShouldBeDeleted = findTodo(todoId, model);
      deleteTodo(todoThatShouldBeDeleted.id, model, li);
      update('RemoveTodo', model, todoThatShouldBeDeleted);
      saveToLocalStorage(model.AllTodos);
    }
  });
})(init);

//* Update Todo
((model: Model) => {
  ul.addEventListener('focusout', (e) => {
    const target = e.target;

    if (target instanceof HTMLParagraphElement) {
      const text = target.textContent !== null ? target.textContent : '';
      const listItem = target.parentElement as HTMLLIElement;
      const listItemID = listItem.dataset.id;

      if (listItemID !== undefined) {
        const updatedTodo: Todo = {
          id: listItemID,
          value: text,
        };
        update('UpdateTodo', model, updatedTodo);
        saveToLocalStorage(model.AllTodos);
      } else {
        throw new Error("This list item doesn't have an ID");
      }
    }
  });
})(init);

// ------------------------------------------------------------------------------
//                              VIEW FUNCTIONS
//-------------------------------------------------------------------------------

/**
 * Creates a list item
 * @param id - The unique ID of the list item todo
 * @param text - The actual todo itself
 * @returns {string} The inner HTML of the <li> including the li itself
 */
function renderListItem(id: string, text: string): string {
  const listItem = `
        <li class="list-item" data-id=${id}>
          <button class="complete-btn">
            <img src="/src/assets/images/icon-check.svg" alt="" />
          </button>
          <p class="list-item-text" contenteditable="true">${text}</p>
          <button class="delete-btn todo-delete-icon">
            <img class="d" src="/src/assets/images/icon-cross.svg" alt="" />
          </button>
        </li>
    `;

  return listItem;
}

/**
 * Displays all the todos from the global state unto the page
 * @param todos - The global state
 */
function renderTodos(todos: Todo[]) {
  ul.innerHTML = '';

  let tempStorage: string[] = [];
  for (const todo of todos) {
    tempStorage.push(renderListItem(todo.id, todo.value.trim()));
    input.value = '';
  }
  ul.innerHTML = tempStorage.join('');
}

// ------------------------------------------------------------------------------
//                              HELPER FUNCTIONS
//-------------------------------------------------------------------------------
/**
 * Checks if a string is empty. Will trim the the middle of the string
 * @param str - A string that will be checked
 * @returns {boolean} True if string is empty, false otherwise
 */
function CheckIfEmptyString(str: string): boolean {
  return str.trim() === '';
}

/**
 * Generates a unique id
 * @returns {string} A unique ID
 */
function generateId(): string {
  return Math.random().toString(36).slice(2);
}

/**
 * Creates an object of type Todo
 * @param value - A string which should be the actual todo itself
 * @returns {Todo} A todo object
 */
function createTodoObject(value: string): Todo {
  return {
    id: generateId(),
    value: value,
  };
}

/**
 * Checks for the type of button being passed in
 * @param element - The button that was clicked on
 * @returns {validButton} A message stating the type of button that was clicked on
 * @throws {new Error} A string error built with the Error constructor
 * @example checkTypeOfButton(deleteBtn) -> 'delete-btn'
 */
function checkTypeOfButton(element: HTMLButtonElement): validButton {
  if (element.classList.contains('todo-delete-icon')) {
    return 'delete-btn';
  } else {
    throw new Error('Not a valid type of button');
  }
}

/**
 * Finds a specific Todo based on an ID
 * @param id - A unique ID belonging to an object of type Todo
 * @param model - The global state
 * @returns {Todo} The Todo which matches the id passed in
 */
function findTodo(id: string, model: Model): Todo {
  const matchingTodo = model.AllTodos.filter((todo) => todo.id === id);

  return matchingTodo[0];
}

/**
 * Removes a Todo <li> from the DOM
 * @param id - A unique id belonging to an object of type Todo
 * @param model - The global state
 * @param listElement - A list element to be removed
 * @returns {Todo} The deleted Todo object
 */
function deleteTodo(
  id: string,
  model: Model,
  listElement: HTMLLIElement
): Todo {
  const todo = findTodo(id, model);
  listElement.remove();

  return todo;
}

/**
 * Saves users todos to local storage
 * @param todos - The global state that should be saved to local storage
 */
function saveToLocalStorage(todos: Todo[]) {
  const todoToJson = JSON.stringify(todos);
  localStorage.setItem('todos', todoToJson);
}

/**
 * Retrieves a JSON string from localStorage
 * @param itemName - The key in the key:value pair of localStorage
 * @returns {string} Either a string of the users todos or an empty array
 */
function getItemsFromLocalStorage(itemName: string): string {
  const storage = localStorage.getItem(itemName);
  return storage !== null ? storage : '[]';
}

/**
 * Parses the users todo's
 * @param item - Parses a string
 * @returns {Todo[]} An array of objects of type Todo
 */
function parseTodos(item: string): Todo[] {
  return JSON.parse(item);
}
