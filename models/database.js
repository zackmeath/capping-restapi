var pg = require('pg');
var express = require('express');
var router = express.Router();

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
