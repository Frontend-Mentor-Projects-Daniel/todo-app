(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
// WHEN USER CLICKS ON COMPLETED BUTTON, ADD GRADIENT
// get the id of the todo
// find the specific todo
// change the completed property to true
// Save the state
// WHEN USER CLICKS ON COMPLETED BUTTON, ADD LINE THROUGH
// get the id of the todo
// find the specific todo
// change the p tag to a del tag
// -> This will probably require some updating of the renderListItem function
// -> May also be better to create a function to render a single todo rather than re-render all of them
// ------------------------------------------------------------------------------
//                                 DOM NODES
//-------------------------------------------------------------------------------

var todos = document.querySelectorAll('.todo-list-item');
var form = document.querySelector('.create-bar-form');
var input = document.querySelector('.create-bar');
var ul = document.querySelector('.list');
var template = document.querySelector('#example-list-item');
// ------------------------------------------------------------------------------
//                               GLOBAL STATE
//-------------------------------------------------------------------------------
var init = {
    AllTodos: []
};
Object.freeze(init);
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
    }
}
// ------------------------------------------------------------------------------
//                                   SCRIPTS
//-------------------------------------------------------------------------------
// GET TODOS FROM LOCAL STORAGE AND DISPLAY THEM
(function (model) {
    var getStoredTodos = getItemsFromLocalStorage('todos');
    var parseStoredTodos = parseTodos(getStoredTodos);
    // if there're no previous todo's, create example todo
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
    // add event listener to initial todo so that it can be set to complete as well
    var allTodos = document.querySelectorAll('.complete-btn');
    allTodos.forEach(function (todo) {
        todo.addEventListener('click', function (e) {
            // handleCompletedClick(e, model);
            saveToLocalStorage(model.AllTodos);
        });
    });
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
            saveToLocalStorage(model.AllTodos);
        }
        renderTodos(model.AllTodos);
    });
})(init);
// DELETE TODOS
(function (model) {
    ul.addEventListener('click', function (e) {
        var xImage = e.target;
        var button = xImage.parentElement;
        var li = button.parentElement;
        var todoId = li.dataset.id;
        var isDeleteOrUpdateBtn = checkTypeOfButton(button);
        if (isDeleteOrUpdateBtn === 'delete-btn') {
            var todoThatShouldBeDeleted = findTodo(todoId, model);
            deleteTodo(todoThatShouldBeDeleted.id, model, li);
            update('RemoveTodo', model, todoThatShouldBeDeleted);
            saveToLocalStorage(model.AllTodos);
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
            if (listItemID !== undefined) {
                var updatedTodo = {
                    id: listItemID,
                    value: text,
                    completed: false
                };
                var newChild = document.createElement('del');
                newChild.className = 'list-item-text';
                newChild.textContent = text;
                var oldChild = target;
                var parent = listItem;
                var replacementInfo = { parent: parent, newChild: newChild, oldChild: oldChild };
                // console.log(replacementInfo);
                update('UpdateTodo', model, updatedTodo);
                // handleCompletedClick(e, model, replacementInfo);
                saveToLocalStorage(model.AllTodos);
            } else {
                throw new Error("This list item doesn't have an ID");
            }
        }
    });
})(init);
// COMPLETE TODO
(function (model) {
    // Options for the observer (which mutations to observe)
    var config = { childList: true };
    // Callback function to execute when mutations are observed
    var callback = function callback(mutationList) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = mutationList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var mutation = _step2.value;

                if (mutation.type === 'childList') {
                    if (mutation.addedNodes.length !== 0) {
                        var allCompleteButtons = document.querySelectorAll('.complete-btn');
                        allCompleteButtons.forEach(function (button) {
                            button.removeEventListener('click', function () {});
                            button.addEventListener('click', function () {
                                var listItem = button.parentElement;
                                var pOrDel = listItem.children[1];
                                var todoText = pOrDel.textContent;
                                var del = document.createElement('del');
                                del.textContent = todoText;
                                del.className = 'list-item-text';
                                var p = document.createElement('p');
                                p.textContent = todoText;
                                p.className = 'list-item-text';
                                p.setAttribute('contenteditable', 'true');
                                if (pOrDel instanceof HTMLParagraphElement) {
                                    listItem.replaceChild(del, pOrDel);
                                } else {
                                    listItem.replaceChild(p, pOrDel);
                                }
                                if (listItem.dataset.id != null) {
                                    var currentTodo = findTodo(listItem.dataset.id, model);
                                    var opposite = !currentTodo.completed;
                                    listItem.dataset.completed = String(opposite);
                                    update('CompleteTodo', model, currentTodo);
                                    saveToLocalStorage(model.AllTodos);
                                }
                            });
                        });
                    }
                }
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
    };
    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(ul, config);
    // add a mutation so that the mutationObserver will automatically kick in
    var newLi = document.createElement('li');
    newLi.dataset.id = '000';
    var shouldDelete = newLi;
    ul.append(newLi);
    if (shouldDelete.dataset.id === '000') {
        shouldDelete.remove();
    }
})(init);
// SET FILTER
(function (model) {})(init);
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
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = todos[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var todo = _step3.value;

            var determineElement = todo.completed ? 'del' : 'p';
            tempStorage.push(createListItem(todo.id, todo.value.trim(), todo.completed, determineElement));
            input.value = '';
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
function createListItem(id, text) {
    var completed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var el = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'p';

    var listItem = '\n        <li class="list-item" data-id=' + id + ' data-completed="' + completed + '">\n          <button class="complete-btn">\n            <img src="/src/assets/images/icon-check.svg" aria-hidden="true" alt="" />\n          </button>\n          <' + el + ' class="list-item-text" contenteditable="true">' + text + '</' + el + '>\n          <button class="delete-btn todo-delete-icon">\n            <img class="d" src="/src/assets/images/icon-cross.svg" alt="" />\n          </button>\n        </li>\n    ';
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
 * Saves users todos to local storage
 * @param todos - The global state that should be saved to local storage
 */
function saveToLocalStorage(todos) {
    var todoToJson = JSON.stringify(todos);
    localStorage.setItem('todos', todoToJson);
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
/**
 * Simply for taking out the bloat from the script itself
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

},{}]},{},[1])

//# sourceMappingURL=bundle.js.map
