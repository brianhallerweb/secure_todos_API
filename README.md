## Private routes

### POST /users (sign up)

1.  Client sends a request with email and string password
2.  JWT is added to the request object
3.  User password is hashed and salted
4.  Everything is saved to the database
5.  JWT is return to the client via http header

![Alt text](/diagrams/SignUpRoute.jpg)

---

### POST /users/login

1.  Client sends a request with their email and string password
2.  Database is queried for users by email - one is returned along with its hashed password.
3.  Having access to both the string password and the hashed password, they are compared with bcrypt.js compare function.
4.  If the password is verified, a token is generated, saved into the db, and returned to the client as a header.

![Alt text](/diagrams/LoginRoute.jpg)

---

### DELETE /users/logout

1.  Clients sends request object with token in header
2.  After passing authentication middleware, the user id and token are added to the request
3.  Token is removed from the database via a fancy mongoose function called $pull.
4.  200 success code is returned to the client.

![Alt text](/diagrams/LogoutRoute.jpg)

---

### Authentication Middleware

1.  Client sends request with JWT
2.  findByToken function on the User model finds the user
3.  If there is a user in the database that matches the token, the token and user id are added to the request object
4.  Request object proceeds to the private part of the route.

![Alt text](/diagrams/AuthenticationMiddlware.jpg)

---

### Private POST and GET todo routes

These routes simple use the authentication middleware and the \_creator field on each todo.
