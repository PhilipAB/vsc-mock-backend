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
`npm i express @types/express express-validator @types/express-validator`
to provide the server-side logic for our project\
`npm i -D typescript @types/node nodemon` (devDependencies for ts and monitoring + re-running on changes)\
`npm i mysql2` database driver for MySQL (if you choose another database, please change your driver accordingly)
`npm i dotenv` to load the environment variables from our process.env file
`npm i @types/dotenv` dotenv for typescript

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

To begin with, we will create 3 Tables in our database. 

The first one will be our user table: 
```
CREATE TABLE User (
    id INT AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    role ENUM('Lecturer', 'Student') NOT NULL,
    PRIMARY KEY (id) 
);
```

After that we will add out course table to our database:
```
CREATE TABLE Course (
    id INT AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    creator_id INT NOT NULL, 
    PRIMARY KEY (id),
    FOREIGN KEY (creator_id) REFERENCES User(id)
);
```

And finally we will insert the course user relation table to resolve the many-to-many relationship:
```
CREATE TABLE CourseUserRelation (
    u_id INT,
    c_id INT,
    PRIMARY KEY (u_id, c_id),
    FOREIGN KEY (u_id) REFERENCES User(id),
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

app.post('/createUser', async (req, res) => {
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





