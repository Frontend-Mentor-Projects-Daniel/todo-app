(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
// DOM NODES

var todos = document.querySelectorAll('.todo-list-item');
var form = document.querySelector('.create-bar-form');
var input = document.querySelector('.create-bar');
var ul = document.querySelector('.list');
// GLOBAL STATE
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
        case 'ReadTodo':
            model.AllTodos.push(value);
            break;
    }
}
// VIEW SCRIPTS
//* Get Todos from localStorage
(function (model) {
    var getStoredTodos = getItemsFromLocalStorage('todos');
    var parseStoredTodos = parseTodos(getStoredTodos);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = parseStoredTodos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var todo = _step.value;

            update('ReadTodo', model, todo);
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

    renderTodos(model.AllTodos);
})(init);
//* Create New Todo
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
//* Delete Todo
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
//* Update Todo
(function (model) {
    // TODO: Update no longer has an update button, thus this needs to change
    // ul.addEventListener('click', (e) => {
    //   const button = e.target as HTMLButtonElement;
    //   const li = button.parentElement as HTMLLIElement;
    //   const p = li.firstElementChild as HTMLParagraphElement;
    //   const todoId = li.dataset.id as string;
    //   const isDeleteOrUpdateBtn = checkTypeOfButton(button);
    //   if (isDeleteOrUpdateBtn === 'update-btn') {
    //     const oldTodo = findTodo(todoId, model);
    //     const updatedTodo = Object.assign(oldTodo, {
    //       value: p.textContent?.trim(),
    //     });
    //     update('UpdateTodo', model, updatedTodo);
    //     saveToLocalStorage(model.AllTodos);
    //   }
    // });
})(init);
// VIEW FUNCTIONS
// create list item
function renderListItem(id, text) {
    var listItem = '\n        <li class="list-item" data-id=' + id + '>\n          <button class="complete-btn">\n            <img src="/src/assets/images/icon-check.svg" alt="" />\n          </button>\n          <p class="list-item-text" contenteditable="true">' + text + '</p>\n          <button class="delete-btn todo-delete-icon">\n            <img class="d" src="/src/assets/images/icon-cross.svg" alt="" />\n          </button>\n        </li>\n    ';
    return listItem;
}
// display all todos on page
function renderTodos(todos) {
    ul.innerHTML = '';
    var tempStorage = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = todos[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var todo = _step2.value;

            tempStorage.push(renderListItem(todo.id, todo.value.trim()));
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
// HELPER FUNCTIONS
// check if string is empty
function CheckIfEmptyString(str) {
    return str.trim() === '';
}
// generate unique id
function generateId() {
    return Math.random().toString(36).slice(2);
}
// create todo object
function createTodoObject(value) {
    return {
        id: generateId(),
        value: value
    };
}
// Check to see if button is update or delete button
function checkTypeOfButton(element) {
    if (element.classList.contains('todo-delete-icon')) {
        return 'delete-btn';
    } else if (element.classList.contains('todo-update-icon')) {
        return 'update-btn';
    } else {
        return 'content-editing';
    }
}
// find a todo
function findTodo(id, model) {
    var matchingTodo = model.AllTodos.filter(function (todo) {
        return todo.id === id;
    });
    return matchingTodo[0];
}
// delete a todo
function deleteTodo(id, model, listElement) {
    var todo = findTodo(id, model);
    listElement.remove();
    return todo;
}
// save todos to local storage
function saveToLocalStorage(todos) {
    var todoToJson = JSON.stringify(todos);
    localStorage.setItem('todos', todoToJson);
}
// get todos from local storage
function getItemsFromLocalStorage(itemName) {
    var storage = localStorage.getItem(itemName);
    return storage !== null ? storage : '[]';
}
// parse todos
function parseTodos(item) {
    return JSON.parse(item);
}

},{}]},{},[1])

//# sourceMappingURL=bundle.js.map
