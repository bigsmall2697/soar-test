# School Management API

## Introduction

The School Management API is a comprehensive backend solution designed to facilitate the management of `users`, `schools`, `classrooms`, and `students` within an educational environment. It offers features for user `authentication`, `authorization`, and `CRUD operations` on essential entities such as users, schools, classrooms, and students.

## Installation

- Install MongoDB or Redis and run the server

- Install the node modules and dependencies used in this application:

    ```
    npm install
    ```

- Run the seed script to create a super admin

    ```
    npm run seed
    ```

- To run the application in development environment, run the following command:

    ```
    npm run dev
    ```

## Testing

- Run the automated unit testing using the following command:

    ```
    npm run test
    ```

## Authentication

Authentication is required for all endpoints. The API uses JSON Web Tokens (JWT) for authentication. To authenticate, include the JWT token in the Token header of the request.\
Authentication middleware: `/mws/__longToken.mw.js`

## Base URL

The base URL for all API endpoints is `https://soar-test.onrender.com/api`.

## Documentation

`Swagger` documentation is hosted on `https://soar-test.onrender.com/docs`