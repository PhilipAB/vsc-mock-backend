import express from 'express';
import { Pool } from 'mysql2/promise';
import { connectionPool } from './connection/connectionPool';
import { BasicUser } from './models/BasicUser';

// Anonymous function calling itself
// (async () => {
const app = express();
const port: string | number = process.env.PORT || 3000;
const promisePool: Pool = connectionPool.promise();
app.use(express.json());

app.post('/users', async (req, res) => {
    const user: BasicUser = req.body;

    try {
        await promisePool.query("INSERT INTO `User` (`name`, `role`) VALUES(?, ?)", [user.name, user.role]);
        res.status(201).send("User " + user.name + " created.");
    } catch (error) {
        res.send(error);
    }
});

app.get("/", (_req, res) => {
    res.send({
        "test": 150
    })
});

app.listen(port, () => {
    console.log('Listening on port: ', port);
});
// })();
