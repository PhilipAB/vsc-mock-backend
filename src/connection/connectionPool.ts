import mysql, {Pool} from 'mysql2';
import * as dotenv from 'dotenv';
dotenv.config({ path: './process.env' });

/* Connection pools help reduce the time spent connecting to the MySQL server by reusing a previous connection, 
leaving them open instead of closing when you are done with them.
This improves the latency of queries as you avoid all of the overhead that comes with establishing a new connection.

https://www.npmjs.com/package/mysql2#using-connection-pools */

// Create and export the connection pool.
export const connectionPool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
