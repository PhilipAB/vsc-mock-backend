# VSC Mock Backend

The VSC Mock Backend is an express REST API written in Typescript.
The aim of this project is to simulate the lecturer's [HAW-OPPSEE](https://oppsee.informatik.haw-hamburg.de/) backend service of [Hamburg University of Applied Sciences](https://www.haw-hamburg.de/en). It is done to sample the vscprototype (the lecturer's frontend component) interacting with a backend.

Das VSC Mock Backend ist eine in Typescript geschriebene express REST API. 
Ziel dieses Projekts ist es, den Lehrendenservice des [HAW-OPPSEE](https://oppsee.informatik.haw-hamburg.de/)-Backends der [HAW Hamburg](https://www.haw-hamburg.de), im Zusammenspiel mit dem vscprototype (der Frontend-Lehrendenkomponente) zu erproben.

## Basic setup 

If you are interested in building the basic setup of this project on your own, please follow the steps below.

### Node + express + typescript setup

Run the following command in an empty newly created folder:\
`npm init`

Fill out the following fields to set up your npm project, e.g. with:
`package name: vscode-mock-backend`\
`version: 1.0.0`\
`description: A simple mock backend that simulates the HAW-OPPSEE API.`\
`git repository:` 
*`(optional - leave blank or type in your repository's remote fetch URL if you want to publish it)`*\
`keywords:` *`(optional - leave blank or type in keywords which are properly describing your project)`*\
`licence: ISC` *`(default) or any other licence that meets your criteria`*

`Is this OK? yes`

Alternatively it is possible to run generate a npm project with defaults by adding the flag `-y`:\
`npm init -y`

Now first we install some necessary dependecies:\
`npm i express express-validator`\
`npm i -D @types/express @types/express-validator`\
to provide the server-side logic for our project\
`npm i -D typescript @types/node nodemon` (devDependencies for ts and monitoring + re-running on changes)\
`npm i mysql2` database driver for MySQL (if you choose another database, please change your driver accordingly)\
`npm i dotenv` to load the environment variables from our process.env file\
`npm i -D @types/dotenv` dotenv for typescript\
`npm i bcrypt @types/bcrypt` to hash our stored course password\
`npm i cors` to set cors policy in express\
`npm i -D @types/cors`\
`npm i jsonwebtoken` to create our own jwt for authentication\
`npm i -D @types/jsonwebtoken`\
`npm i passport` to authenticate via OAuth 2.0 authentication provider\
`npm i -D @types/passport`\
`npm i passport-oauth2` to create our own passport strategies\
`npm i -D @types/passport-oauth2`



Now create a tsconfig.json file in your root folder by either copying this [tsconfig.json](tsconfig.json) or setting up your own with the following command:\
`npx tsc --init`

In your package.json add the following commands to the scripts-section:
```
"watch": "tsc -w",
"dev": "nodemon dist/index.js"
```

To create a little sample API create an index.ts file in your [src folder](src) and paste the following code:
```
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_req, res) => {
    res.send({
        "test": 150
    })
});

app.listen(port, () => {
    console.log('Listening on port: ', port);
});
``` 

Start your backend server by running `npm run watch` and `npm run dev` in seperate terminal windows.
Open http://localhost:3000/ in your browser. You should now see a JSON Object with test as key and 150 as value:
```
{"test":150}
```

### MySQL setup 

First, make sure to install [MySQL](https://dev.mysql.com/downloads) Community Server on your device. If your operating system is Windows, you can use the MySQL Installer, which will guide you through the download and installation process.  

Note: In the following steps we will interact with a (MySQL) database using simple SQL queries. If you prefer to work with an object-relational mapping (ORM) tool, e.g. typeorm, or if you prefer to work with another database, you may want to adapt this part to your needs. Moreover, you may consider to download the official MySQL Workbench if you like having an visual interface or download a MySQL extension if you plan to keep everything within Visual Studio Code. 

Otherwise just connect to MySQL via your terminal:\
`mysql -u root -p`\
`Enter password:` *`Your root password`*

Create a new database for this project (e.g.):\
`CREATE DATABASE vsc_mock_backend_db;`

Create a new user who is responsible to access this database:\
`CREATE USER 'vsc_user'@'localhost IDENTIFIED WITH mysql_native_password' BY` *`your vsc_user password`*\
`GRANT ALL PRIVILIGES ON vsc_mock_backend_db.* TO vsc_user@localhost`

Exit MySQL and connect with your newly created user to your new database:\
`exit;`\
`mysql -u vsc_user -p`\
`Enter password:` *`your vsc_user password`*
`USE vsc_mock_backend_db`

To begin with, we will create 5 Tables in our database. 

The first one will be our user table: 
```
CREATE TABLE User (
    id INT AUTO_INCREMENT,
    provider_id INT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    role ENUM('Lecturer', 'Student') NOT NULL DEFAULT 'Student',
    PRIMARY KEY (id) 
);
```

After that we will add out course table to our database:
```
CREATE TABLE Course (
    id INT AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    creator_id INT NOT NULL,
    description TEXT, 
    PRIMARY KEY (id),
    FOREIGN KEY (creator_id) REFERENCES User(id)
);
```

Now we will insert the course user relation table to resolve the many-to-many relationship:
```
CREATE TABLE CourseUserRelation (
    u_id INT,
    c_id INT,
    hidden BOOLEAN NOT NULL DEFAULT 0,
    starred BOOLEAN NOT NULL DEFAULT 0,
    role ENUM('CourseAdmin', 'Teacher', 'Student') NOT NULL DEFAULT 'Student',
    visited DATETIME,
    PRIMARY KEY (u_id, c_id),
    FOREIGN KEY (u_id) REFERENCES User(id),
    FOREIGN KEY (c_id) REFERENCES Course(id) 
);
```

For Assignment creation we will use the following table:
```
CREATE TABLE Assignment (
    id INT AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
	repository VARCHAR(255) NOT NULL UNIQUE,
    description TEXT, 
    PRIMARY KEY (id)
);
```
The repository column represents a git repository link where we clone our assignment from.

Finally we will insert a simple course assignment table to map courses to assignments or vice versa:
```
CREATE TABLE CourseAssignmentRelation (
    a_id INT,
    c_id INT,
    PRIMARY KEY (a_id, c_id),
    FOREIGN KEY (a_id) REFERENCES Assignment(id),
    FOREIGN KEY (c_id) REFERENCES Course(id) 
);
``` 

To connect to your database, you need to create a new process.env file with the following environment variables:\
PORT=3000 *(or any different port that you may prefer)*\
DB_HOST="localhost"\
DB_USER=*"your username, e.g. **vsc_user**"*\
DB_PWD=*"your password"*\
DB_NAME=*"your database name, e.g. **vsc_mock_backend_db**"*

You can use the [process.txt](process-template.txt) file provided by this repository as a template and rename it to process.env.\
Note: Do not forget to include `.env` in your gitignore!

Once the process.env file is configured, we are ready to create our [connection pool](src/connection/pool.ts). This will allow us to make queries in our database. 

Let us implement a short POST request to test our connection to the database. To do so, you can use the following piece of code after you initialized your express app:
```
const promisePool: Pool = pool.promise();
app.use(express.json());

app.post('/users', async (req, res) => {
    const userName: string = req.body.name;
    const role: string = req.body.role;

    try {
        await promisePool.query("INSERT INTO `User` (`name`, `role`) VALUES(?, ?)", [userName, role]);
        res.send("User " + userName + " created.");
    } catch (error) {
        res.send(error);
    }
});
```

By using an API client (e.g. [Postman](https://www.postman.com/downloads/)) you can now test your connection. Insert a user with two json parameters:
```
{
    "name":"Philip",
    "role":"Lecturer"
}
```

By calling `SELECT * FROM user;` within your terminal's mysql connection, you should now see one row in your set. 
You can delete it again by running the following query: `DELETE FROM user WHERE id = 1;`.

Now we are finished with the basic setup for our mock backend. Stay tuned for future commits to improve our file structure, extend the domain model as well as the API and more. 

## Commit Log

A set of all commits with a brief description in this project.

### Commit 1 – C1

Initial commit. Basic setup of a mock backend with express and mysql, written in typescript.  

### Commit 2 – C2

Changed naming from "pool" to "ConnectionPool".

### Commit 3 – C3

Updated README.md: Extended README.md by three sections (**commit log**, **known issues** and **release notes**).

### Commit 4 – C4

Updated README.md: Capitalized letters in **README**.md.

### Commit 5 – C5

Added models and type(s). A model represents a table in our database.\
A type does not. (In this case) it helps to specify a column more precisely.

### Commit 6 – C6

Updated sql queries in README.md for table definitions. The **name** column in user and course table is now unique, so we will not have courses/users with the exact same name in our database.

### Commit 7 – C7

Updated models and types. Renamed route from */createUser* to */users*. Added columns hidden, starred and role to CourseUserRelation table. Added default values for roles. Changed naming convention for exported constants from PascalCase to camelCase.  

### Commit 8 – C8

Added controllers encapsulating the logic to perform CRUD (create, read, update and delete) operations on our database. Added type predicates to ensure that we can operate safely on our controllers' expected return types. Added new get route */users* and post/get route */courses*.   

### Commit 9 – C9

Added missing dependency *bcrypt*.

### Commit 10 – C10

Added (custom middleware) validation and sanitization to help preventing injection of harmful code. 

### Commit 11 – C11

Renamed ConnectionPool.ts to connectionPool.ts. 

### Commit 12 – C12

Added routers encapsulating the logic to handle HTTP requests/responses. 

### Commit 13 – C13

Merge because of code formatting.

### Commit 14 – C14

**Removed** the following test route from index.ts: 

```
app.get("/", (_req, res) => {
    res.send({
        "test": 150
    })
});
```

### Commit 15 – C15

Removed unnecessary nested try catch block in CourseController.ts. Transferred encryption logic from CourseController.ts to courseRouter.ts. Parameters in CourseUserRelationController.ts better adapted to the domain model. 

### Commit 16 – C16

Removed unnecessary *async* modifier.

### Commit 17 – C17

Added services. Added error handlers. Updated application structure.

Routers: Manage which actions (validation, sanitization, controller/middleware methods) are performed on a specific API call.

Controllers: Handle all of our business logic.

Services: Manage CRUD (create, read, update, delete) operations on our database.

### Commit 18 - C18

Added passport strategies (with GitHub and/or GitLab) to authenticate via OAuth 2.0. To set this up you need to create a an OAuth application on [Github](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) or [GitLab](https://docs.gitlab.com/ee/integration/oauth_provider.html#user-owned-applications). At the moment authentication with GitHub is enabled. If you want to switch to GitLab, you need to change the **GitHubOAuth2Strategy** to **GitLabOAuth2Strategy** in [authenticationRouter](src/routers/authenticationRouter.ts). Be aware that you might need to switch the gitlab host url. You can do so by passing the required one as a parameter. Moreover do not forget to set the CLIENT_ID, CLIENT_SECRET and CALLBACK_URL in your process.env. To get the passport strategies to work, you need to set the callback url as `http://localhost:3000/authenticate/provider/callback`.   

Implemented own authentication flow to issue JSON Web Tokens (jwt refresh/access tokens) to the client. To verify tokens you need to provide a JWT_ACCESS_SECRET and a JWT_REFRESH_SECRET in your process.env. You can generate those keys by using crypto. Since it is a build-in module, just type `node` in your terminal. Then generate two keys with the following function: 
```
require('crypto').randomBytes(32).toString('hex')
``` 

Added cors policy for vscode. Modified models and project structure. Added profile route. Slightly modified services.  

### Commit 19 - C19

Added course routes. It is now possible to retrieve courses by id and update their star/hidden property.

### Commit 20 - C20

Added course routes. It is now possible to sign up for courses and access them by their id.

### Commit 21 - C21

Added validation of Course Admin/Teacher rights.

### Commit 22 - C22

Added course routes. It is now possible to get users from course id and to update their user roles if course admin role is validated.

### Commit 23 - C23

Added **description** column to Course table and **visited** column to Courseuserrelation table. Added route to update visited column.

### Commit 24 - C24

Changed status code to 409 on duplicate entries for course name. 

### Commit 25 - C25

Added authentication for get (all) courses route.

### Commit 26 - C26

Added Assignment table and CourseAssignmentRelation table to database.\
Implemented assignmentRouter with the following routes:\
POST "/assignments" -> to create assignments\
POST "/assignments/assignments/:aId/course/:cId" -> to add existing assignments to courses\
GET "/assignments" -> to get all assignments\
GET "/assignments/:id/courses" -> to get all courses which use a specific assignment

Added the following route to courseRouter:\
GET "/courses/course/:id/assignments" -> to get all assignments for a specific course

Implemented needed internal logic in controllers, services and middleware for new routes.\
Added some models for Assignments/CourseAssignmentRelation.\
Added a new "SimpleCourse" Model which only contains id and name.\
Added user-defined type guards for some of the new models.

### Commit 27 - C27

Added regular expression to validate repository url.

### Commit 28 - C28

Implemented routes to retrieve unrelated courses/assignments.

## Known Issues

A set of all known issues in this project.

## Release Notes

No official release yet.

### 1.0.0

No official release yet ...



