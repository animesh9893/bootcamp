const { Client } = require('pg');

function ConnectDB(){
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'bootcamp',
        password: 'bootcamp',
        port: 5432,
    });
    
    client.connect();

    return [
        client,
        ()=> {
            client.end()
        },
    ]
}

module.exports = {
    ConnectDB,
}

// client.query('SELECT * FROM your_table', (err, res) => {
//     if (err) throw err;
//     console.log(res.rows);
//     client.end();
// });
  

// client.end();
