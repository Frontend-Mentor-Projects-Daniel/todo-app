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
const themeToggler = document.querySelector(
  '.theme-toggler'
) as HTMLButtonElement;
const body = document.body as HTMLBodyElement;

// ------------------------------------------------------------------------------
//                                 TYPES
//-------------------------------------------------------------------------------
type Todo = {
  id: string;
  value: string;
  completed: boolean;
};

type validButton = 'delete-btn' | 'complete-btn' | 'not-a-button';

type allowedElements = 'p' | 'del';

type CurrentTheme = {
  theme: string;
  image: string;
};

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
type Msg =
  | 'AddTodo'
  | 'RemoveTodo'
  | 'UpdateTodo'
  | 'CompleteTodo'
  | 'RearrangeOrder';

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

    case 'RearrangeOrder':
      // find current todo index
      const todoPosition = model.AllTodos.indexOf(value);

      // splice previous todo out
      model.AllTodos.splice(todoPosition, 1);

      // splice current todo in
      // model.AllTodos.splice()

      console.log(model.AllTodos);

      break;
  }
}

// ------------------------------------------------------------------------------
//                                   SCRIPTS
//-------------------------------------------------------------------------------

// GET SAVED DATA FROM LOCAL STORAGE AND DISPLAY THEM
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

  // display last used theme
  const lastActiveTheme = JSON.parse(getItemsFromLocalStorage('theme'));
  // getItemsFromLocalStorage returns an empty array if the key isn't found
  if (lastActiveTheme.length !== 0) {
    toggleTheme(lastActiveTheme);
  }

  // update status bar to display the number of todos
  renderNumberOfTodos(model);
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
      saveTodosToLocalStorage(model.AllTodos);
    }

    renderTodos(model.AllTodos);

    // when a todo is added, make sure that the status bar is updated
    renderNumberOfTodos(model);
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
      saveTodosToLocalStorage(model.AllTodos);

      // when a todo is deleted, make sure that the status bar is updated
      renderNumberOfTodos(model);
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
      const listItemID = listItem.dataset.id as string;
      // strip out white spaces so that users can't update a todo to an empty line
      const textPattern = text.replace(/ /g, '').trim();

      // If white space or new line characters are the only things submitted, the todo will be turned back to the previous one
      if (listItemID !== undefined && textPattern.length !== 0) {
        const updatedTodo: Todo = {
          id: listItemID,
          value: text,
          completed: false,
        };
        update('UpdateTodo', model, updatedTodo);
        saveTodosToLocalStorage(model.AllTodos);
      } else {
        const previousTodo = findTodo(listItemID, model);
        const previousText = previousTodo.value;
        target.textContent = previousText;
      }
    }
  });
})(init);

// COMPLETE TODO
((model: Model) => {
  // Options for the observer (which mutations to observe)
  const config = { childList: true };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver((mutationList) => {
    mutateCompletedTodos(mutationList, model);
  });

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

// MOVE MAIN TAG WHEN THERE'RE NO TODOS
((model: Model) => {
  const config = { childList: true };

  const observer = new MutationObserver((mutationList) => {
    mutateStatusBar(mutationList, model);
  });

  observer.observe(ul, config);
})(init);

// TOGGLE THEME
((model: Model) => {
  themeToggler.addEventListener('click', (e) => {
    toggleTheme();
  });
})(init);

// FILTER TASKS
((model: Model) => {
  const tabs = document.querySelectorAll('.tabs') as NodeListOf<HTMLDivElement>;
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const button = e.target as HTMLButtonElement;

      if (button.classList.contains('all')) {
        renderTodos(model.AllTodos);
        toggleAriaSelected(button);
      }

      if (button.classList.contains('active')) {
        const completedTodos = model.AllTodos.filter((todo) => !todo.completed);
        renderTodos(completedTodos);
        toggleAriaSelected(button);
      }

      if (button.classList.contains('completed')) {
        const completedTodos = model.AllTodos.filter((todo) => todo.completed);
        renderTodos(completedTodos);
        toggleAriaSelected(button);
      }
    });
  });
})(init);

// DISPLAY NUMBER OF UN-COMPLETED TODOS
((model: Model) => {
  // Options for the observer (which mutations to observe)
  const config = { childList: true, subtree: true };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver((mutationList) => {
    mutateRemainingTodosDisplay(mutationList, model);
  });

  // Start observing the target node for configured mutations
  observer.observe(ul, config);
})(init);

// CLEAR ALL COMPLETED TASKS
((model: Model) => {
  const clearButtons = document.querySelectorAll(
    '.clear-btn'
  ) as NodeListOf<HTMLButtonElement>;

  clearButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const completedListItems: HTMLLIElement[] = getCompletedListItems();
      let counter = 0;

      const completedTodos = model.AllTodos.filter((todo) => todo.completed);

      completedTodos.forEach((todo) => {
        update('RemoveTodo', model, todo);
        saveTodosToLocalStorage(model.AllTodos);
        deleteTodo(todo.id, model, completedListItems[counter]);
        counter++;
      });
    });
  });
})(init);

// DRAG AND DROP TASKS
/**
 * Returns the element that comes after the current position of a dragged element
 */
function getDragAfterElement(container, y: number) {
  const draggableElements = [
    ...container.querySelectorAll('[draggable="true"]:not(.dragging)'),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

((model: Model) => {
  ul.addEventListener('dragstart', (e) => {
    const target = e.target as HTMLElement;
    if (target.getAttribute('draggable') === 'true') {
      target.classList.add('dragging');
    }
  });

  ul.addEventListener('dragend', (e) => {
    const target = e.target as HTMLElement;
    if (target.getAttribute('draggable') === 'true') {
      target.classList.remove('dragging');
      function turnHtmlToTodoArray() {
        const strippedTodoId = target.dataset.id as string;
        const todo: Todo = findTodo(strippedTodoId, model);

        // TODO: Find a way to get the new position of the list item and save splice that in to the global state
        update('RearrangeOrder', model, todo);

        // saveTodosToLocalStorage(model.AllTodos)
      }

      turnHtmlToTodoArray();
    }
  });

  ul.addEventListener('dragover', (e) => {
    // dragging and appending a child to a container is disabled by default, this is to prevent that default
    e.preventDefault();
    const currentlyDraggedItem = document.querySelector(
      '.dragging'
    ) as HTMLLIElement;
    // the element positioned right after the currently being dragged element
    const afterElement = getDragAfterElement(ul, e.clientY);
    if (afterElement == null) {
      ul.appendChild(currentlyDraggedItem);
    } else {
      ul.insertBefore(currentlyDraggedItem, afterElement);
    }
  });
})(init);

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
 * Toggles the active attribute on a list item
 * @param listItem An un-completed list item
 */
function toggleActiveAttribute(listItem: HTMLLIElement) {
  if (listItem.dataset.currentlyActive === 'true') {
    listItem.dataset.currentlyActive = 'false';
  } else {
    listItem.dataset.currentlyActive = 'true';
  }
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

    update('CompleteTodo', model, currentTodo);

    toggleCompleteAttribute(listItem, currentTodo.completed);
  }
}

/**
 * Changes the number of todos in the display bar(s)
 * @param model The current state which should know which todos are currently completed
 */
function renderNumberOfTodos(model: Model) {
  const todosLeft = document.querySelectorAll(
    '.items-left p'
  ) as NodeListOf<HTMLParagraphElement>;

  const unCompletedTodos = model.AllTodos.filter((todo) => !todo.completed);

  todosLeft.forEach((todo) => {
    if (unCompletedTodos.length === 1) {
      todo.textContent = `${unCompletedTodos.length} item left`;
    } else {
      todo.textContent = `${unCompletedTodos.length} items left`;
    }
  });
}

function toggleTheme(theme?: CurrentTheme) {
  const imageIcon = themeToggler.firstElementChild as HTMLImageElement;
  // if a current theme exists, use that
  if (theme != null) {
    body.id = theme.theme;
    imageIcon.setAttribute('src', theme.image);
    return;
  }

  let currentTheme: CurrentTheme = {
    theme: '',
    image: '',
  };

  if (body.id === 'light') {
    body.id = 'dark';
    imageIcon.setAttribute('src', '/src/assets/images/icon-sun.svg');
    const imageSrc = imageIcon.getAttribute('src') as string;
    currentTheme = { theme: body.id, image: imageSrc };
    saveThemeToLocalStorage(currentTheme);
  } else {
    body.id = 'light';
    imageIcon.setAttribute('src', '/src/assets/images/icon-moon.svg');
    const imageSrc = imageIcon.getAttribute('src') as string;
    currentTheme = { theme: body.id, image: imageSrc };
    saveThemeToLocalStorage(currentTheme);
  }
}

/**
 * Toggles the aria-selected attribute of a tab to either "true" or "" while resetting the value of the other tabs
 * @param tab One of the tabs, all, active or completed
 */
function toggleAriaSelected(tab: HTMLButtonElement) {
  // reset the aria-selected attribute on all the tabs
  const allTabs = document.querySelectorAll(
    '.tabs button'
  ) as NodeListOf<HTMLButtonElement>;
  allTabs.forEach((tab) => {
    tab.setAttribute('aria-selected', '');
  });

  const isSelected = tab.getAttribute('aria-selected');
  if (isSelected === null || isSelected === '') {
    tab.setAttribute('aria-selected', 'true');
  }
}

// ------------------------------------------------------------------------------
//                                   DATABASE
//-------------------------------------------------------------------------------

/**
 * Saves users todos to local storage
 * @param todos - The global state that should be saved to local storage
 */
function saveTodosToLocalStorage(todos: Todo[]) {
  const todoToJson = JSON.stringify(todos);
  localStorage.setItem('todos', todoToJson);
}

/**
 * Saves the value of the body's id property and the src attribute of the image icon to local storage
 * @param theme The current theme, light/dark && sun/moon-icon
 */
function saveThemeToLocalStorage(theme: CurrentTheme) {
  localStorage.setItem('theme', JSON.stringify(theme));
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
        <li class="list-item" data-id=${id} data-completed="${completed}" draggable="true">
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

/**
 * Selects all of the list items todos from the DOM, turns them into an array and returns the completed ones
 * @returns An array of List Item todos
 */
function getCompletedListItems() {
  const listItems = document.querySelectorAll(
    '.list-item'
  ) as NodeListOf<HTMLLIElement>;
  const listItemsArray: HTMLLIElement[] = [...listItems];
  const completedListItems = listItemsArray.filter(
    (li) => li.dataset.completed === 'true'
  );

  return completedListItems;
}

// ------------------------------------------------------------------------------
//                             MUTATION OBSERVERS
//-------------------------------------------------------------------------------
/**
 *  Mutation that should occur to a todo list item when the complete button is clicked
 * @param mutationList The data associated with each mutation
 * @param model Used because the global state of the todos is required
 */
function mutateCompletedTodos(mutationList: MutationRecord[], model: Model) {
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
              saveTodosToLocalStorage(model.AllTodos);
            }
          });
        });
      }
    }
  }
}

/**
 *  Mutation that should occur the display on the status bar that shows the remaining un-completed todos
 * @param mutationList The data associated with each mutation
 * @param model Used because the global state of the todos is required
 */
function mutateRemainingTodosDisplay(
  mutationList: MutationRecord[],
  model: Model
) {
  for (const mutation of mutationList) {
    if (mutation.type === 'childList') {
      if (
        mutation.addedNodes[0] instanceof HTMLModElement ||
        mutation.addedNodes[0] instanceof HTMLParagraphElement
      ) {
        renderNumberOfTodos(model);
      }
    }
  }
}

/**
 *  Mutation that should occur to the status bar when they're no todos left
 * @param mutationList The data associated with each mutation
 * @param model Used because the global state of the todos is required
 */
function mutateStatusBar(mutationList: MutationRecord[], model: Model) {
  for (const mutation of mutationList) {
    if (mutation.type === 'childList') {
      const main = document.querySelector('main') as HTMLElement;

      if (model.AllTodos.length === 0 && main !== null) {
        main.style.transform = 'translateY(0)';
      } else {
        main.style.transform = 'translateY(-24px)';
      }
    }
  }
}
