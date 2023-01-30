(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
// ------------------------------------------------------------------------------
//                                 DOM NODES
//-------------------------------------------------------------------------------

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var todos = document.querySelectorAll('.todo-list-item');
var form = document.querySelector('.create-bar-form');
var input = document.querySelector('.create-bar');
var ul = document.querySelector('.list');
var template = document.querySelector('#example-list-item');
var themeToggler = document.querySelector('.theme-toggler');
var body = document.body;
// ------------------------------------------------------------------------------
//                               GLOBAL STATE
//-------------------------------------------------------------------------------
var init = {
    AllTodos: []
};
/**
 * For updating the global state, it should only update the global state and it should be the only thing which can update it
 * @param msg A message that will indicate what should be done to the global state
 * @param model The global state
 * @param value The Todo in which something should be done to
 * @param extra Anything else that may need to be added, usually for bonus functionality
 */
function update(msg, model, value) {
    switch (msg) {
        case 'AddTodo':
            model.AllTodos.push(value);
            break;
        case 'RemoveTodo':
            model.AllTodos.forEach(function (todo) {
                if (todo.id === value.id) {
                    var index = model.AllTodos.indexOf(todo);
                    model.AllTodos.splice(index, 1);
                }
            });
            break;
        case 'UpdateTodo':
            model.AllTodos.forEach(function (todo) {
                if (todo.id === value.id) {
                    var index = model.AllTodos.indexOf(todo);
                    model.AllTodos[index].value = value.value;
                }
            });
            break;
        case 'CompleteTodo':
            model.AllTodos.forEach(function (todo) {
                if (todo.id === value.id) {
                    var index = model.AllTodos.indexOf(todo);
                    model.AllTodos[index].completed = !value.completed;
                }
            });
            break;
        case 'RearrangeOrder':
            var allListItems = document.querySelectorAll('.list-item');
            model.AllTodos = [];
            allListItems.forEach(function (listItem) {
                var isCompleted = convertStringToBool(listItem.dataset.completed);
                var newTodo = {
                    id: listItem.dataset.id,
                    value: listItem.children[1].textContent,
                    completed: isCompleted
                };
                model.AllTodos.push(newTodo);
            });
            break;
    }
}
// ------------------------------------------------------------------------------
//                                   SCRIPTS
//-------------------------------------------------------------------------------
// GET SAVED DATA FROM LOCAL STORAGE AND DISPLAY THEM
(function (model) {
    var getStoredTodos = getItemsFromLocalStorage('todos');
    var parseStoredTodos = parseTodos(getStoredTodos);
    // if there're no previous todo's, create example todo else update the state to contain all the stored todos
    if (parseStoredTodos.length === 0) {
        var newTodo = renderListItemNode(template);
        update('AddTodo', model, newTodo);
    } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = parseStoredTodos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var todo = _step.value;

                update('AddTodo', model, todo);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    renderTodos(model.AllTodos);
    // display last used theme
    var lastActiveTheme = JSON.parse(getItemsFromLocalStorage('theme'));
    // getItemsFromLocalStorage returns an empty array if the key isn't found
    if (lastActiveTheme.length !== 0) {
        toggleTheme(lastActiveTheme);
    }
    // update status bar to display the number of todos
    renderNumberOfTodos(model);
})(init);
// CREATE NEW TODOS
(function (model) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var getUserInput = input.value.trim();
        var isUserInputEmpty = CheckIfEmptyString(getUserInput);
        var createNewTodo = createTodoObject(getUserInput);
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
(function (model) {
    ul.addEventListener('click', function (e) {
        var deleteIconImage = e.target;
        var button = deleteIconImage.parentElement;
        var listItem = button.parentElement;
        var todoId = listItem.dataset.id;
        var isDeleteOrUpdateBtn = checkTypeOfButton(button);
        if (isDeleteOrUpdateBtn === 'delete-btn') {
            var todoThatShouldBeDeleted = findTodo(todoId, model);
            deleteTodo(todoThatShouldBeDeleted.id, model, listItem);
            update('RemoveTodo', model, todoThatShouldBeDeleted);
            saveTodosToLocalStorage(model.AllTodos);
            // when a todo is deleted, make sure that the status bar is updated
            renderNumberOfTodos(model);
        }
    });
})(init);
// UPDATE TODOS
(function (model) {
    ul.addEventListener('focusout', function (e) {
        var target = e.target;
        if (target instanceof HTMLParagraphElement) {
            var text = target.textContent !== null ? target.textContent : '';
            var listItem = target.parentElement;
            var listItemID = listItem.dataset.id;
            // strip out white spaces so that users can't update a todo to an empty line
            var textPattern = text.replace(/ /g, '').trim();
            // If white space or new line characters are the only things submitted, the todo will be turned back to the previous one
            if (listItemID !== undefined && textPattern.length !== 0) {
                var updatedTodo = {
                    id: listItemID,
                    value: text,
                    completed: false
                };
                update('UpdateTodo', model, updatedTodo);
                saveTodosToLocalStorage(model.AllTodos);
            } else {
                var previousTodo = findTodo(listItemID, model);
                var previousText = previousTodo.value;
                target.textContent = previousText;
            }
        }
    });
})(init);
// COMPLETE TODO
(function (model) {
    // Options for the observer (which mutations to observe)
    var config = { childList: true };
    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(function (mutationList) {
        mutateCompletedTodos(mutationList, model);
    });
    // Start observing the target node for configured mutations
    observer.observe(ul, config);
    // add a mutation so that the mutationObserver code will automatically kick in
    var newLi = document.createElement('li');
    newLi.dataset.id = '000';
    var shouldDelete = newLi;
    ul.append(newLi);
    if (shouldDelete.dataset.id === '000') {
        shouldDelete.remove();
    }
})(init);
// MOVE MAIN TAG WHEN THERE'RE NO TODOS
(function (model) {
    var config = { childList: true };
    var observer = new MutationObserver(function (mutationList) {
        mutateStatusBar(mutationList, model);
    });
    observer.observe(ul, config);
})(init);
// TOGGLE THEME
(function (model) {
    themeToggler.addEventListener('click', function (e) {
        toggleTheme();
    });
})(init);
// FILTER TASKS
(function (model) {
    var tabs = document.querySelectorAll('.tabs');
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function (e) {
            var button = e.target;
            if (button.classList.contains('all')) {
                renderTodos(model.AllTodos);
                toggleAriaSelected(button);
            }
            if (button.classList.contains('active')) {
                var completedTodos = model.AllTodos.filter(function (todo) {
                    return !todo.completed;
                });
                renderTodos(completedTodos);
                toggleAriaSelected(button);
            }
            if (button.classList.contains('completed')) {
                var _completedTodos = model.AllTodos.filter(function (todo) {
                    return todo.completed;
                });
                renderTodos(_completedTodos);
                toggleAriaSelected(button);
            }
        });
    });
})(init);
// DISPLAY NUMBER OF UN-COMPLETED TODOS
(function (model) {
    // Options for the observer (which mutations to observe)
    var config = { childList: true, subtree: true };
    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(function (mutationList) {
        mutateRemainingTodosDisplay(mutationList, model);
    });
    // Start observing the target node for configured mutations
    observer.observe(ul, config);
})(init);
// CLEAR ALL COMPLETED TASKS
(function (model) {
    var clearButtons = document.querySelectorAll('.clear-btn');
    clearButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
            var completedListItems = getCompletedListItems();
            var counter = 0;
            var completedTodos = model.AllTodos.filter(function (todo) {
                return todo.completed;
            });
            completedTodos.forEach(function (todo) {
                update('RemoveTodo', model, todo);
                saveTodosToLocalStorage(model.AllTodos);
                deleteTodo(todo.id, model, completedListItems[counter]);
                counter++;
            });
        });
    });
})(init);
// DRAG AND DROP TASKS
(function (model) {
    ul.addEventListener('dragstart', function (e) {
        var target = e.target;
        if (target.getAttribute('draggable') === 'true') {
            target.classList.add('dragging');
        }
    });
    ul.addEventListener('dragend', function (e) {
        var target = e.target;
        if (target.getAttribute('draggable') === 'true') {
            target.classList.remove('dragging');
            turnHtmlToTodoArray(target, model);
        }
    });
    ul.addEventListener('dragover', function (e) {
        // dragging and appending a child to a container is disabled by default, this is to prevent that default
        e.preventDefault();
        var currentlyDraggedItem = document.querySelector('.dragging');
        // the element positioned right after the currently being dragged element
        var afterElement = getDragAfterElement(ul, e.clientY);
        // TODO: Bugs arise sometimes when trying to move elements to the last position
        //todo Such bugs include, the complete button not being able to be clicked and playing around with the tabs and moving elements around will cause other elements to get deleted
        if (afterElement == null) {
            var delElement = currentlyDraggedItem.children[1];
            delElement.setAttribute('contenteditable', 'false');
            ul.appendChild(currentlyDraggedItem);
        } else {
            var _delElement = currentlyDraggedItem.children[1];
            _delElement.setAttribute('contenteditable', 'false');
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
function renderTodos(todos) {
    ul.innerHTML = '';
    var tempStorage = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = todos[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var todo = _step2.value;

            var determineElement = todo.completed ? 'del' : 'p';
            tempStorage.push(createListItem(todo.id, todo.value.trim(), todo.completed, determineElement));
            input.value = '';
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    ul.innerHTML = tempStorage.join('');
}
/**
 * Mutates a todo so that its completed data attribute is toggled
 * @param listItem - A list item currently appended to the DOM
 * @param value - What the completed data attribute should be set to
 */
function toggleCompleteAttribute(listItem, value) {
    var isCompleted = value;
    listItem.dataset.completed = isCompleted.toString();
}
/**
 * Toggles the active attribute on a list item
 * @param listItem An un-completed list item
 */
function toggleActiveAttribute(listItem) {
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
function deleteTodo(id, model, listElement) {
    var todo = findTodo(id, model);
    listElement.remove();
    return todo;
}
/**
 * Updates the global state, toggles the completed data attribute on a list item and replaces the p element with a del element if needed
 * @param e - A click event
 * @param model - The global state
 * @param el -
 */
function handleCompletedClick(e, model) {
    var el = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var completeBtn = e.currentTarget;
    var listItem = completeBtn.parentElement;
    var id = listItem.dataset.id;
    if (id !== undefined) {
        var currentTodo = findTodo(id, model);
        currentTodo.completed = !currentTodo.completed;
        update('CompleteTodo', model, currentTodo);
        toggleCompleteAttribute(listItem, currentTodo.completed);
    }
}
/**
 * Changes the number of todos in the display bar(s)
 * @param model The current state which should know which todos are currently completed
 */
function renderNumberOfTodos(model) {
    var todosLeft = document.querySelectorAll('.items-left p');
    var unCompletedTodos = model.AllTodos.filter(function (todo) {
        return !todo.completed;
    });
    todosLeft.forEach(function (todo) {
        if (unCompletedTodos.length === 1) {
            todo.textContent = unCompletedTodos.length + ' item left';
        } else {
            todo.textContent = unCompletedTodos.length + ' items left';
        }
    });
}
function toggleTheme(theme) {
    var imageIcon = themeToggler.firstElementChild;
    // if a current theme exists, use that
    if (theme != null) {
        body.id = theme.theme;
        imageIcon.setAttribute('src', theme.image);
        return;
    }
    var currentTheme = {
        theme: '',
        image: ''
    };
    if (body.id === 'light') {
        body.id = 'dark';
        imageIcon.setAttribute('src', '/src/assets/images/icon-sun.svg');
        var imageSrc = imageIcon.getAttribute('src');
        currentTheme = { theme: body.id, image: imageSrc };
        saveThemeToLocalStorage(currentTheme);
    } else {
        body.id = 'light';
        imageIcon.setAttribute('src', '/src/assets/images/icon-moon.svg');
        var _imageSrc = imageIcon.getAttribute('src');
        currentTheme = { theme: body.id, image: _imageSrc };
        saveThemeToLocalStorage(currentTheme);
    }
}
/**
 * Toggles the aria-selected attribute of a tab to either "true" or "" while resetting the value of the other tabs
 * @param tab One of the tabs, all, active or completed
 */
function toggleAriaSelected(tab) {
    // reset the aria-selected attribute on all the tabs
    var allTabs = document.querySelectorAll('.tabs button');
    allTabs.forEach(function (tab) {
        tab.setAttribute('aria-selected', '');
    });
    var isSelected = tab.getAttribute('aria-selected');
    if (isSelected === null || isSelected === '') {
        tab.setAttribute('aria-selected', 'true');
    }
}
/**
 * Changes the state to match the new order of elements
 * @param target
 * @param model
 */
function turnHtmlToTodoArray(target, model) {
    var strippedTodoId = target.dataset.id;
    var todo = findTodo(strippedTodoId, model);
    var allListItems = document.querySelectorAll('.list-item');
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = allListItems.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _step3$value = _slicedToArray(_step3.value, 2),
                index = _step3$value[0],
                value = _step3$value[1];

            if (value.dataset.id === strippedTodoId) {
                update('RearrangeOrder', model, todo);
            }
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    saveTodosToLocalStorage(model.AllTodos);
}
// ------------------------------------------------------------------------------
//                                   DATABASE
//-------------------------------------------------------------------------------
/**
 * Saves users todos to local storage
 * @param todos - The global state that should be saved to local storage
 */
function saveTodosToLocalStorage(todos) {
    var todoToJson = JSON.stringify(todos);
    localStorage.setItem('todos', todoToJson);
}
/**
 * Saves the value of the body's id property and the src attribute of the image icon to local storage
 * @param theme The current theme, light/dark && sun/moon-icon
 */
function saveThemeToLocalStorage(theme) {
    localStorage.setItem('theme', JSON.stringify(theme));
}
/**
 * Retrieves a JSON string from localStorage
 * @param itemName - The key in the key:value pair of localStorage
 * @returns {string} Either a string of the users todos or an empty array
 */
function getItemsFromLocalStorage(itemName) {
    var storage = localStorage.getItem(itemName);
    return storage !== null ? storage : '[]';
}
/**
 * Parses the users todo's
 * @param item - Parses a string
 * @returns {Todo[]} An array of objects of type Todo
 */
function parseTodos(item) {
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
function createListItem(id, text) {
    var completed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var el = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'p';

    var hasContentEditable = el === 'p' ? 'true' : 'false';
    var listItem = '\n        <li role="tabpanel" aria-labelledby="tab1" class="list-item" data-id=' + id + ' data-completed="' + completed + '" draggable="true">\n          <button class="complete-btn">\n            <img src="/src/assets/images/icon-check.svg" aria-hidden="true" alt="" />\n          </button>\n          <' + el + ' class="list-item-text" contenteditable=' + hasContentEditable + '>' + text + '</' + el + '>\n          <button class="delete-btn todo-delete-icon">\n            <img class="d" src="/src/assets/images/icon-cross.svg" alt="" />\n          </button>\n        </li>\n    ';
    return listItem;
}
/**
 * Checks if a string is empty. Will trim the the middle of the string
 * @param str - A string that will be checked
 * @returns {boolean} True if string is empty, false otherwise
 */
function CheckIfEmptyString(str) {
    return str.trim() === '';
}
/**
 * Generates a unique id
 * @returns {string} A unique ID
 */
function generateId() {
    return Math.random().toString(36).slice(2);
}
/**
 * Creates an object of type Todo
 * @param value - A string which should be the actual todo itself
 * @returns {Todo} A todo object
 */
function createTodoObject(value) {
    return {
        id: generateId(),
        value: value,
        completed: false
    };
}
/**
 * Checks for the type of button being passed in
 * @param element - The button that was clicked on
 * @returns {validButton} A message stating the type of button that was clicked on
 * @throws {new Error} A string error built with the Error constructor
 * @example checkTypeOfButton(deleteBtn) -> 'delete-btn'
 */
function checkTypeOfButton(element) {
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
function findTodo(id, model) {
    var matchingTodo = model.AllTodos.filter(function (todo) {
        return todo.id === id;
    });
    return matchingTodo[0];
}
/**
 * Creates a newTodo out of the example todo
 * @param template - The template to clone and turn into a newTodo object
 * @returns The example Todo
 */
function renderListItemNode(template) {
    var _a, _b;
    var docFragment = template.content;
    var listItemClone = (_a = docFragment.firstElementChild) === null || _a === void 0 ? void 0 : _a.cloneNode(true);
    var id = listItemClone.dataset.id;
    var pEl = listItemClone.childNodes[3];
    var text = (_b = pEl.textContent) === null || _b === void 0 ? void 0 : _b.trim();
    var newTodo = {
        id: id,
        value: text,
        completed: false
    };
    return newTodo;
}
/**
 * Creates a <p> element
 * @param text - The text content of the element
 * @returns A paragraph element which will be the todo itself. It can be edited
 */
function createParagraphElement(text) {
    var p = document.createElement('p');
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
function createDelElement(text) {
    var del = document.createElement('del');
    del.textContent = text;
    del.className = 'list-item-text';
    del.setAttribute('contenteditable', 'false');
    return del;
}
/**
 * Selects all of the list items todos from the DOM, turns them into an array and returns the completed ones
 * @returns An array of List Item todos
 */
function getCompletedListItems() {
    var listItems = document.querySelectorAll('.list-item');
    var listItemsArray = [].concat(_toConsumableArray(listItems));
    var completedListItems = listItemsArray.filter(function (li) {
        return li.dataset.completed === 'true';
    });
    return completedListItems;
}
/**
 * Returns a boolean depending on the string. Used mainly for converting the <li>.dataset.completed from a string to a bool since type Todo requires a boolean
 * @param str A string to convert to a boolean. Will return true for "true" else false for anything else
 * @returns true or false
 */
function convertStringToBool(str) {
    if (str === 'true') {
        return true;
    } else {
        return false;
    }
}
/**
 * Returns the element that comes after the current position of a dragged element
 */
function getDragAfterElement(container, y) {
    var draggableElements = [].concat(_toConsumableArray(container.querySelectorAll('[draggable="true"]:not(.dragging)')));
    return draggableElements.reduce(function (closest, child) {
        var box = child.getBoundingClientRect();
        var offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
// ------------------------------------------------------------------------------
//                             MUTATION OBSERVERS
//-------------------------------------------------------------------------------
/**
 *  Mutation that should occur to a todo list item when the complete button is clicked
 * @param mutationList The data associated with each mutation
 * @param model Used because the global state of the todos is required
 */
function mutateCompletedTodos(mutationList, model) {
    // check the type of mutation
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = mutationList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var mutation = _step4.value;

            if (mutation.type === 'childList') {
                // check to see if any mutation has occurred
                if (mutation.addedNodes.length !== 0) {
                    var allCompleteButtons = document.querySelectorAll('.complete-btn');
                    allCompleteButtons.forEach(function (button) {
                        // remove any previous event listeners before adding anymore in order to avoid any strange behavior
                        button.removeEventListener('click', function () {});
                        button.addEventListener('click', function () {
                            // get the listItem, its first child which will either by a p tag or a del tag and its text content
                            var listItem = button.parentElement;
                            var pOrDel = listItem.children[1];
                            var todoText = pOrDel.textContent;
                            // create a new element that will be inserted depending on whether the todo is completed or not
                            var del = createDelElement(todoText);
                            var p = createParagraphElement(todoText);
                            if (pOrDel instanceof HTMLParagraphElement) {
                                listItem.replaceChild(del, pOrDel);
                            } else {
                                listItem.replaceChild(p, pOrDel);
                            }
                            // update the completed status of the todo
                            if (listItem.dataset.id != null) {
                                var currentTodo = findTodo(listItem.dataset.id, model);
                                var opposite = !currentTodo.completed;
                                listItem.dataset.completed = String(opposite);
                                update('CompleteTodo', model, currentTodo);
                                saveTodosToLocalStorage(model.AllTodos);
                            }
                        });
                    });
                }
            }
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }
}
/**
 *  Mutation that should occur the display on the status bar that shows the remaining un-completed todos
 * @param mutationList The data associated with each mutation
 * @param model Used because the global state of the todos is required
 */
function mutateRemainingTodosDisplay(mutationList, model) {
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = mutationList[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var mutation = _step5.value;

            if (mutation.type === 'childList') {
                if (mutation.addedNodes[0] instanceof HTMLModElement || mutation.addedNodes[0] instanceof HTMLParagraphElement) {
                    renderNumberOfTodos(model);
                }
            }
        }
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }
}
/**
 *  Mutation that should occur to the status bar when they're no todos left
 * @param mutationList The data associated with each mutation
 * @param model Used because the global state of the todos is required
 */
function mutateStatusBar(mutationList, model) {
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = mutationList[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var mutation = _step6.value;

            if (mutation.type === 'childList') {
                var main = document.querySelector('main');
                if (model.AllTodos.length === 0 && main !== null) {
                    main.style.transform = 'translateY(0)';
                } else {
                    main.style.transform = 'translateY(-24px)';
                }
            }
        }
    } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
            }
        } finally {
            if (_didIteratorError6) {
                throw _iteratorError6;
            }
        }
    }
}

},{}]},{},[1])

//# sourceMappingURL=bundle.js.map
