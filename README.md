# To-Do Board
1. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
2. [Frontend](#frontend)
    - [File Structure](#file-structure)
    - [Dependencies](#dependencies)
        - [Dev Dependencies](#dev-dependencies)
    - [NPM Scripts](#npm-scripts)
    - [Pages](#pages)
        - [Index](#index)
        - [Register](#register)
        - [Todo-list](#todo-list)
    - [Styling](#styling)
    - [Functionality](#functionality)
3. [Backend](#backend)
    - [File Structure](#file-structure-1)
    - [Dependencies](#dependencies-1)
    - [Database](#database)
        - [Models](#models)
    - [API Routes](#api-routes)
        - [Page URLs](#page-urls)
        - [Authetication Routes](#authetication-routes)
        - [Todo CRUD Routes](#todo-crud-routes)

## Team Members
Zachary Cervenka - {cervenkaz19@students.ecu.edu}
Michael Carrol - {carrollmi19@students.ecu.edu}
Xavier Floyd - {floydx19@students.ecu.edu}

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com)
- [Python](https://www.python.org)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/zodakzach/to-do-board.git
```

2. Navigate to the backend directory:
```bash
cd backend
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create .env file in backend folder with secret key.

5. Navigate to the frontend directory:
```bash
cd ../frontend
```

6. Install Node.js dependencies:
```bash
npm install
```

7. Start the server:
```bash
npm start
```

## Frontend

### File Structure
- **templates**
  - **index.html** *(Homepage HTML file)*
  - **base.html** *(Base HTML layout file used as a template for other HTML files)*
  - **register.html** *(Registration page HTML file)*
  - **todo-list.html** *(Todo list page HTML file)*

- **static**
  - **css** *(All css files go here)*
    - **styles.css** *(Compiled main CSS file - the actual CSS file that contains all the styles used by browser)*
    - **styles.css.map** *(Source map file for CSS)*
  - **js** *(All js files go here)*
    - **bundle.js** *(Bundled JavaScript file)*
    - **index.js** *(JavaScript file for the index page)*
    - **register.js** *(JavaScript file for the registration page)*
    - **main.js** *(Main JavaScript file that is bundled)*
  - **scss** *(All scss files go here)*
    - **styles.scss** *(SCSS file for custom styles - this is where all our styles will be writtem)*

- **rollup.config.mjs** *(Rollup configuration file)*
- **.stylelintrc** *(Configuration file for Stylelint, a linter for CSS/SCSS)*
- **package-lock.json** *(Auto-generated file for npm dependencies)*
- **package.json** *(File containing project metadata and npm dependencies)*
- **.prettierrc** *(Configuration file for Prettier, a code formatter)*

### Dependencies
- bootstrap: "^5.3.3"
- jquery: "^3.7.1"
- js-datepicker: "^5.18.2"

#### Dev Dependencies
- @rollup/plugin-commonjs: "^25.0.7"
- @rollup/plugin-node-resolve: "^15.2.3"
- autoprefixer: "^10.4.19"
- nodemon: "^3.1.0"
- npm-run-all: "^4.1.5"
- postcss: "^8.4.38"
- postcss-cli: "^11.0.0"
- prettier: "^3.2.5"
- prettier-plugin-jinja-template: "^1.3.3"
- rollup: "^4.13.0"
- sass: "^1.72.0"
- stylelint: "^16.2.1"
- stylelint-config-twbs-bootstrap: "^14.0.0"

### NPM Scripts 
To utilize these scripts, follow these steps:

1. Navigate to the frontend directory in your terminal.
2. Run any of the scripts listed below using the command `npm run {script}`.

Here's a breakdown of the available scripts

- **start**: Starts production server
- **dev**: Runs development environment tasks concurrently. It watches for changes in files and starts the backend server.
- **build**: Builds the project by compiling JavaScript using Rollup and compiling SCSS to CSS.
- **start-backend**: Starts the backend server by navigating to the backend directory and executing the Python script.
- **css-compile**: Compiles SCSS files into compressed CSS with source maps and embeds sources.
- **css-lint**: Lints SCSS files using Stylelint to ensure code quality and consistency.
- **css-prefix**: Adds vendor prefixes to the CSS file using Autoprefixer.
- **css**: Runs both css-compile and css-prefix scripts sequentially to compile SCSS files and add prefixes to CSS.
- **watch**: Monitors changes in HTML and SCSS files, triggering the build script accordingly.
- **test**: Runs linting and CSS compilation tasks to ensure code quality and style consistency.
- **format**: Formats HTML files using Prettier to maintain consistent code style.

These scripts streamline various development tasks such as compiling code, watching for changes, running tests, and formatting code.

### Pages
#### Index
- index.html: This is the HTML file for the index page of our application. It contains the layout structure and content for the home/login page.
- index.js: JavaScript file associated with the index page. It include scripts to validate user inputs and handle form submission for login.
#### Register
- register.html: HTML file for the registration page. It provides a form for users to register with their credentials.
- register.js: JavaScript file for the registration page. It include scripts to validate user inputs and handle form submission for registration.
#### Todo-list
- todo-list.html: HTML file for the todo list page. This page displays the list of todos for the logged-in user and provides options to add, edit, and delete todos.
- todo-list.js: JavaScript file for the todo list page. It contains scripts to interact with the backend API to fetch and update todos, as well as handle user interactions like marking todos as completed or editing todo details.
#### Settings
- settings.js: JavaScript file for the settings page
- settings.html: HTML file for the settings page

### Styling
We are utilizing Bootstrap, a popular CSS framework, to ensure consistency and responsiveness in our application's design. Additionally, we are writing our custom styles in SCSS (Sass) for enhanced maintainability and readability. These SCSS files are then compiled into CSS using the Sass compiler. Moreover, we employ PostCSS, a tool for transforming CSS with JavaScript plugins, to enhance our CSS files further.

### Functionality
We are leveraging jQuery, a fast, small, and feature-rich JavaScript library, to simplify DOM manipulation and event handling in our application. Additionally, we use Rollup, a module bundler, to bundle all our JavaScript files into a single file named bundle.js. This bundling process helps optimize our application's performance by reducing the number of HTTP requests needed to load JavaScript resources.

## Backend

### File Structure
- **todo_board.db** *(This file is a SQLite database file used for dev by the application to store data related to todos, users, or other entities.)*
- **requirements.txt** *(This file contains a list of Python packages required for your project.)*
- **.env** *(This file is used to store environment variables for your Flask application. It may contain sensitive information like database URLs, API keys, or other configuration settings.)*
- **src**
  - **auth.py** *(This file contains routes and logic related to user authentication, such as login, logout, and registration.)*
  - **models.py** *(This file defines the database models for the application.)*
  - **\_\_init\_\_.py** *(This file marks the src directory as a Python package.)*
  - **todo_crud.py** *(This file contains routes and logic related to CRUD operations for todos, such as creating, reading, updating, and deleting todos.)*
  - **main.py** *(This file contains the entry point for the Flask application, including app initialization and configuration.)*
- **test**
  - **auth_tests.py** *(This file contains unit tests for the authentication routes and logic defined in auth.py.)*
  - **todo_crud_tests.py** *(This file contains unit tests for the CRUD routes and logic defined in todo_crud.py.)*

### Dependencies
- flask
- Flask-SQLAlchemy
- jinja2
- psycopg2
- flask-login
- python-dotenv
- flask-bcrypt
- flask-testing

### Database

We are using SQLAlchemy as our ORM (Object-Relational Mapper) for managing the database schema. Below are the models defined for our application:

#### Models

User
- id: Primary key identifying each user uniquely.
- username: Username of the user.
- email: Email address of the user (unique).
- password: Hashed password of the user.
- created_at: Timestamp indicating when the user account was created.
- updated_at: Timestamp indicating the last update to the user account.

Todo
- id: Primary key identifying each todo uniquely.
- user_id: Foreign key referencing the id column in the users table, indicating the owner of the todo.
- task: Description of the todo task.
- priority: Priority level of the todo task (low, medium, high).
- due_date: Optional due date for the todo task.
- status: Status (completed, in progress, paused, or not started)
- created_at: Timestamp indicating when the todo was created.
- updated_at: Timestamp indicating the last update to the todo.

Database Engine
For development, we are using SQLite, a lightweight and easy-to-use database engine. However, for production, we plan to use PostgreSQL for its robustness and scalability.

By using SQLAlchemy, we can seamlessly switch between different database engines without changing our application's code significantly. This flexibility allows us to develop and test with SQLite locally while deploying with PostgreSQL in production environments.

### API Routes
#### Page URLS
- Index Page: http://127.0.0.1:5000/
- Register Page: http://127.0.0.1:5000/auth/register
- Todo-List Page: (Requires authentication): http://127.0.0.1:5000/todo-list
- Settings Page: (Requires authentication): http://127.0.0.1:5000/settings

#### Authetication Routes
- POST /auth/register: Register a new user.
- POST /auth/login: Log in with existing credentials.
- GET /auth/logout (Requires authentication): Log out the current user.
- PUT /auth/update (Requires authentication): Updates current users username, email, and password.
- DELETE /auth/delete (Requires authentication): Deletes the current user.

#### Todo CRUD Routes
- POST /todos: Create a new todo. (Requires authentication)
- GET /todos: Get all todos for the current user. (Requires authentication)
- GET /todos/<int:id>: Get a specific todo by ID. (Requires authentication)
- PUT /todos/<int:id>: Update a todo by ID. (Requires authentication)
- DELETE /todos/<int:id>: Delete a todo by ID. (Requires authentication)
