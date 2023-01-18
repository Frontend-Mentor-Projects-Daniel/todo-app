// DOM NODES
const todos = document.querySelectorAll(
  '.todo-list-item'
) as NodeListOf<HTMLLIElement>;
const form = document.querySelector('.create-bar-form') as HTMLFormElement;
const input = document.querySelector('.create-bar') as HTMLInputElement;
const ul = document.querySelector('.list') as HTMLUListElement;

// TYPES
type Todo = {
  id: string;
  value: string;
};

type validButton = 'delete-btn' | 'update-btn' | 'content-editing';

// MODEL
type Model = {
  AllTodos: Todo[];
};

// GLOBAL STATE
const init: Model = {
  AllTodos: [],
};
Object.freeze(init);

// UPDATE
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
// VIEW SCRIPTS

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

// VIEW FUNCTIONS

// create list item
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

// display all todos on page
function renderTodos(todos: Todo[]) {
  ul.innerHTML = '';

  let tempStorage: string[] = [];
  for (const todo of todos) {
    tempStorage.push(renderListItem(todo.id, todo.value.trim()));
    input.value = '';
  }
  ul.innerHTML = tempStorage.join('');
}

// HELPER FUNCTIONS

// check if string is empty
function CheckIfEmptyString(str: string): boolean {
  return str.trim() === '';
}

// generate unique id
function generateId() {
  return Math.random().toString(36).slice(2);
}

// create todo object
function createTodoObject(value: string): Todo {
  return {
    id: generateId(),
    value: value,
  };
}

// Check to see if button is update or delete button
function checkTypeOfButton(element: HTMLButtonElement): validButton {
  if (element.classList.contains('todo-delete-icon')) {
    return 'delete-btn';
  } else if (element.classList.contains('todo-update-icon')) {
    return 'update-btn';
  } else {
    return 'content-editing';
  }
}

// find a todo
function findTodo(id: string, model: Model): Todo {
  const matchingTodo = model.AllTodos.filter((todo) => todo.id === id);

  return matchingTodo[0];
}

// delete a todo
function deleteTodo(
  id: string,
  model: Model,
  listElement: HTMLLIElement
): Todo {
  const todo = findTodo(id, model);
  listElement.remove();

  return todo;
}

// save todos to local storage
function saveToLocalStorage(todos: Todo[]) {
  const todoToJson = JSON.stringify(todos);
  localStorage.setItem('todos', todoToJson);
}

// get todos from local storage
function getItemsFromLocalStorage(itemName: string): string {
  const storage = localStorage.getItem(itemName);
  return storage !== null ? storage : '[]';
}

// parse todos
function parseTodos(item: string): Todo[] {
  return JSON.parse(item);
}
