require('dotenv').config();

const { Pool } = require('pg');

global.dbClients = [];

class Db {
    static async nwConnect() {
        if (global.nwDbClient) {
            return global.nwDbClient.connect();
        }
        
        const config = {
            host: process.env.NW_HOST,
            user: process.env.NW_USER,
            password: process.env.NW_PASS,
            port: process.env.NW_PORT,
            database: process.env.NW_DB,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        };
        // console.log(config);
        const pool = new Pool(config);
    
        // const client = await pool.connect();
        // console.log("Criou pool de conexões no PostgreSQL!");
    
        // const res = await client.query('SELECT NOW()');
        // console.log(res.rows[0]);
        // client.release();
    
        //guardando para usar sempre o mesmo
        global.nwDbClient = pool;
        return pool.connect();
    }
    
    static async connect(dbId) {
        if (global.dbClients[dbId]) {
            return global.dbClients[dbId].connect();
        }
    
        const client = await Db.nwConnect();
    
        const res = await client.query('select * from tb_bd where id = $1', [dbId]);
    
        const db = res.rows[0];

        const config = {
            host: process.env.NW_HOST,
            user: db.usr,
            password: db.sen,
            port: db.prt,
            database: db.bd,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        };
        // console.log(config);
        const pool = new Pool(config);

        global.dbClients[dbId] = pool;
        
        return pool.connect();
    }

    static async changeConnectionStatus(dbId, connectionId, status) {
        try {
            const client = await Db.connect(dbId);
            const res = await client.query('update tb_im_con set sit = $1 where wa__id_sessao = $2', [status, connectionId]);
            
            console.log('BD alterado com sucesso ' + res.rowCount + ' ' + status);
    
            return res.rowCount;
        } catch (error) {
            console.log(error);
        }
    }
};

module.exports = {
    Db
}