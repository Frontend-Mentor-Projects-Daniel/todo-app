// ------------------------------------------------------------------------------
//                                 DOM NODES
//-------------------------------------------------------------------------------
const todos = document.querySelectorAll(
  '.todo-list-item'
) as NodeListOf<HTMLLIElement>;
const form = document.querySelector('.create-bar-form') as HTMLFormElement;
const input = document.querySelector('.create-bar') as HTMLInputElement;
const ul = document.querySelector('.list') as HTMLUListElement;
const template = document.querySelector(
  '#example-list-item'
) as HTMLTemplateElement;

// ------------------------------------------------------------------------------
//                                 TYPES
//-------------------------------------------------------------------------------
type Todo = {
  id: string;
  value: string;
  completed: boolean;
};

type validButton = 'delete-btn' | 'complete-btn' | 'not-a-button';

type allowedElements = 'p' | 'ins' | 'del';

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

// ------------------------------------------------------------------------------
//                             UPDATE FUNCTION
//-------------------------------------------------------------------------------
type Msg = 'AddTodo' | 'RemoveTodo' | 'UpdateTodo' | 'CompleteTodo';

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

    case 'CompleteTodo':
      model.AllTodos.forEach((todo) => {
        if (todo.id === value.id) {
          const index = model.AllTodos.indexOf(todo);
          model.AllTodos[index].completed = !value.completed;
        }
      });
      break;
  }
}

// ------------------------------------------------------------------------------
//                                   SCRIPTS
//-------------------------------------------------------------------------------

// GET TODOS FROM LOCAL STORAGE AND DISPLAY THEM
((model: Model) => {
  const getStoredTodos: string = getItemsFromLocalStorage('todos');
  const parseStoredTodos: Todo[] = parseTodos(getStoredTodos);

  // if there're no previous todo's, create example todo else update the state to contain all the stored todos
  if (parseStoredTodos.length === 0) {
    const newTodo = renderListItemNode(template);
    update('AddTodo', model, newTodo);
  } else {
    for (const todo of parseStoredTodos) {
      update('AddTodo', model, todo);
    }
  }

  renderTodos(model.AllTodos);
})(init);

// CREATE NEW TODOS
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

// DELETE TODOS
((model: Model) => {
  ul.addEventListener('click', (e) => {
    const deleteIconImage = e.target as HTMLImageElement;
    const button = deleteIconImage.parentElement as HTMLButtonElement;

    const listItem = button.parentElement as HTMLLIElement;

    const todoId = listItem.dataset.id as string;
    const isDeleteOrUpdateBtn = checkTypeOfButton(button);

    if (isDeleteOrUpdateBtn === 'delete-btn') {
      const todoThatShouldBeDeleted = findTodo(todoId, model);
      deleteTodo(todoThatShouldBeDeleted.id, model, listItem);
      update('RemoveTodo', model, todoThatShouldBeDeleted);
      saveToLocalStorage(model.AllTodos);
    }
  });
})(init);

// UPDATE TODOS
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
          completed: false,
        };
        update('UpdateTodo', model, updatedTodo);
        saveToLocalStorage(model.AllTodos);
      } else {
        throw new Error("This list item doesn't have an ID");
      }
    }
  });
})(init);

// COMPLETE TODO
((model: Model) => {
  // Options for the observer (which mutations to observe)
  const config = { childList: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList: MutationRecord[]) => {
    // check the type of mutation
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        // check to see if any mutation has occurred
        if (mutation.addedNodes.length !== 0) {
          const allCompleteButtons = document.querySelectorAll('.complete-btn');

          allCompleteButtons.forEach((button) => {
            // remove any previous event listeners before adding anymore in order to avoid any strange behavior
            button.removeEventListener('click', () => {});

            button.addEventListener('click', () => {
              // get the listItem, its first child which will either by a p tag or a del tag and its text content
              const listItem = button.parentElement as HTMLLIElement;
              const pOrDel = listItem.children[1];
              const todoText = pOrDel.textContent as string;

              // create a new element that will be inserted depending on whether the todo is completed or not
              const del = createDelElement(todoText);
              const p = createParagraphElement(todoText);

              if (pOrDel instanceof HTMLParagraphElement) {
                listItem.replaceChild(del, pOrDel);
              } else {
                listItem.replaceChild(p, pOrDel);
              }

              // update the completed status of the todo
              if (listItem.dataset.id != null) {
                const currentTodo = findTodo(listItem.dataset.id, model);
                const opposite = !currentTodo.completed;
                listItem.dataset.completed = String(opposite);

                update('CompleteTodo', model, currentTodo);
                saveToLocalStorage(model.AllTodos);
              }
            });
          });
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(ul, config);

  // add a mutation so that the mutationObserver code will automatically kick in
  const newLi = document.createElement('li') as HTMLLIElement;
  newLi.dataset.id = '000';
  const shouldDelete = newLi;
  ul.append(newLi);
  if (shouldDelete.dataset.id === '000') {
    shouldDelete.remove();
  }
})(init);

// SET FILTER
((model: Model) => {})(init);

// ------------------------------------------------------------------------------
//                              VIEW FUNCTIONS
//-------------------------------------------------------------------------------

/**
 * Displays all the todos from the global state unto the page
 * @param todos - The global state
 */
function renderTodos(todos: Todo[]) {
  ul.innerHTML = '';

  let tempStorage: string[] = [];
  for (const todo of todos) {
    const determineElement = todo.completed ? 'del' : 'p';

    tempStorage.push(
      createListItem(
        todo.id,
        todo.value.trim(),
        todo.completed,
        determineElement
      )
    );
    input.value = '';
  }
  ul.innerHTML = tempStorage.join('');
}

/**
 * Mutates a todo so that its completed data attribute is toggled
 * @param listItem - A list item currently appended to the DOM
 * @param value - What the completed data attribute should be set to
 */
function toggleCompleteAttribute(listItem: HTMLLIElement, value: boolean) {
  const isCompleted = value;

  listItem.dataset.completed = isCompleted.toString();
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
 * Updates the global state, toggles the completed data attribute on a list item and replaces the p element with a del element if needed
 * @param e - A click event
 * @param model - The global state
 * @param el -
 */
function handleCompletedClick(e: Event, model: Model, el = {}) {
  const completeBtn = e.currentTarget as HTMLButtonElement;

  const listItem = completeBtn.parentElement as HTMLLIElement;
  const id = listItem.dataset.id;

  if (id !== undefined) {
    const currentTodo = findTodo(id, model);
    currentTodo.completed = !currentTodo.completed;

    // const determineElement = currentTodo.completed ? 'del' : 'p';

    // const completedTodo = createListItem(
    //   id,
    //   currentTodo.value,
    //   currentTodo.completed,
    //   determineElement
    // );

    update('CompleteTodo', model, currentTodo);

    toggleCompleteAttribute(listItem, currentTodo.completed);
  }
}

// ------------------------------------------------------------------------------
//                              HELPER FUNCTIONS
//-------------------------------------------------------------------------------
/**
 * Creates a list item
 * @param id - The unique ID of the list item todo
 * @param text - The actual todo itself
 * @param el - Represents an Html element, ins and del are semantically correct but a p tag can be used as well
 * @param completed - Reflects whether the complete button has been clicked or not
 * @returns {string} The inner HTML of the <li> including the li itself
 */
function createListItem(
  id: string,
  text: string,
  completed: boolean = false,
  el: allowedElements = 'p'
): string {
  const listItem = `
        <li class="list-item" data-id=${id} data-completed="${completed}">
          <button class="complete-btn">
            <img src="/src/assets/images/icon-check.svg" aria-hidden="true" alt="" />
          </button>
          <${el} class="list-item-text" contenteditable="true">${text}</${el}>
          <button class="delete-btn todo-delete-icon">
            <img class="d" src="/src/assets/images/icon-cross.svg" alt="" />
          </button>
        </li>
    `;

  return listItem;
}

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
    completed: false,
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
  } else if (element.classList.contains('complete-btn')) {
    return 'complete-btn';
  } else {
    return 'not-a-button';
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

/**
 * Creates a newTodo out of the example todo
 * @param template - The template to clone and turn into a newTodo object
 * @returns The example Todo
 */
function renderListItemNode(template: HTMLTemplateElement): Todo {
  const docFragment: DocumentFragment = template.content;
  const listItemClone = docFragment.firstElementChild?.cloneNode(
    true
  ) as HTMLLIElement;

  const id = listItemClone.dataset.id as string;
  const pEl = listItemClone.childNodes[3];
  const text = pEl.textContent?.trim() as string;

  const newTodo: Todo = {
    id: id,
    value: text,
    completed: false,
  };

  return newTodo;
}

/**
 * Creates a <p> element
 * @param text - The text content of the element
 * @returns A paragraph element which will be the todo itself. It can be edited
 */
function createParagraphElement(text: string): HTMLParagraphElement {
  const p = document.createElement('p');
  p.textContent = text;
  p.className = 'list-item-text';
  p.setAttribute('contenteditable', 'true');

  return p;
}

/**
 * Creates a <del> element
 * @param text - The text content of the element
 * @returns A del element which will be the todo itself. It cannot be edited
 */
function createDelElement(text: string): HTMLModElement {
  const del = document.createElement('del');
  del.textContent = text;
  del.className = 'list-item-text';

  return del;
}
