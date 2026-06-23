require('dotenv').config();

const pool = require('./db/pool');

async function test() {
    try {

        const res = await pool.query(
            'SELECT NOW()'
        );

        console.log(
            'Connected successfully!'
        );

        console.log(
            res.rows[0]
        );

    } catch(err) {

        console.error(
            'Connection failed'
        );

        console.error(err);

    } finally {

        await pool.end();

    }
}

test();