# Frontend Mentor - Todo app solution

![Design preview for the Todo app coding challenge](./design/desktop-preview.jpg)

This is a solution to the [Todo app challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/todo-app-Su1_KokOW). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## The challenge

Users should be able to:

- View the optimal layout for the app depending on their device's screen size
- See hover states for all interactive elements on the page
- Add new todos to the list
- Mark todos as complete
- Delete todos from the list
- Filter by all/active/complete todos
- Clear all completed todos
- Toggle light and dark mode
- **Bonus**: Drag and drop to reorder items on the list

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Links](#links)
- [My process](#my-process)
  - [Architecture](#architecture)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

### Links

- [Live Site URL](https://curious-bavarois-65fdf8.netlify.app/)

## My process

### Architecture

- I used the Elm architecture. Elm is a functional programming language that compiles down to Javascript, it has only a single architecture that is named after itself.

- Essentially, we have a Model which is what our global state will look like (_all state should be controlled by our global state_)

- We have a Msg type, which is the type of message that a user can send back to the server

- We have an update function which will update the global state in someway depending on the type of message

- Underneath is where I keep my scripts, this isn't part of the Elm architecture but I thought that things would be better this way. Each script is isolated from the others due to being contained within an IFFE (_immediately invoked function expression_), this way any variables created within these scopes won't bleed through and affect anything else. Every new piece of functionality will get its own script

- Underneath that, I have my view functions which are functions that mutate the DOM in some way (_i.e they change a data attribute on some element or render something to the DOM and so on_) followed by the functions I use to access localStorage and underneath that are the helper functions then the callback functions for the mutation observers

- A user, through an event listener will send a message to the server which will call update with a specific message and will update the global state. This is similar to Redux (_because redux copied this from Elm_)

- I also kept everything in one file since that is also the Elm way to do it. They suggest keeping everything together and only breaking it up when needed thus its normal to have several hundred lines of code per file

### Built with

- Semantic HTML5 markup
- SCSS
- CUBE CSS Methodology
- Typescript
- Gulp
- TS Docs (_For generating documentation_)

### What I learned

- Mutation observer is quite useful. So useful in fact that I was tempted to use it quite a few times but I held back and only used where it would make things either significantly simpler or when I couldn't figure out how to do things another way

### Continued development

- I rather like the app called [Todoist](https://todoist.com/) and in the future I may add some of the functionality I see here except tweak it to suite my needs more

### Useful resources

[Mutation Observer #1](https://www.youtube.com/watch?v=Mi4EF9K87aM&t=2s)
[Mutation Observer #2](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
[Drag and Drop Events #1](https://www.youtube.com/watch?v=jfYWwQrtzzY&t=2s)
[Drag and Drop Events #2](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

## Author

- [My portfolio](https://daniel-arzani-portfolio.netlify.app/)
- [My Frontend Mentor](https://www.frontendmentor.io/profile/danielarzani)

## Acknowledgments

A friend my bootcamp days asked me if I wanted to work on a project with him, I said okay.

We decided to skip doing the designing ourselves so we went for a frontend mentor project

After completing the project I re-wrote the functionality using TypeScript and following the Elm architecture of the programming language Elm

[This](https://github.com/AhmedAlkh/to-do-app) is the repo to the collaboration
