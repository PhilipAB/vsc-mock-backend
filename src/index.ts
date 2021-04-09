import express from 'express';
import { Pool } from 'mysql2/promise';
import { pool } from './connection/pool';

// Anonymous function calling itself
// (async () => {
const app = express();
const port: string | number = process.env.PORT || 3000;
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

app.get("/", (_req, res) => {
    res.send({
        "test": 150
    })
});

app.listen(port, () => {
    console.log('Listening on port: ', port);
});
// })();
