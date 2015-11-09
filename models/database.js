var pg = require('pg');
var express = require('express');
var router = express.Router();

var connectionObject = {
          user: 'postgres',
          password: 'postgresCAPPING',
          database: 'cappingdb',
          port: 5432,
          host: '10.10.1.37',
};

var client = new pg.Client(connectionObject);
client.connect();


/* Query result format
 * {
 *     command: 'SELECT',
 *     rowCount: 123,
 *     oid: NaN,
 *     rows: [],
 *     fields: [
 *         {
 *             name: 'scid',
 *             tableId: 25360,
 *             columnId: 1,
 *             dataTypeId: 23,
 *             dataTypeSize: 4,
 *             dataTypeModifier: -1,
 *             format: 'Text'
 *         }
 *     ],
 *     parsers: [[Function], [Function: noParse] ]],
 *     RowCtor: [Function],
 *     rowAsArray: false,
 *     _getTypeParser: [Function]
 * }
 */

var query = client.query('SELECT * from Student');
query.on('row', function(row){
    console.log(row);
}).on('end', function(output) {
        console.log("Done with query");
        client.end(); 
        });
