var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var types = require('pg').types

var connectionObject = {
          user: 'postgres',
          password: 'postgresCAPPING',
          database: 'cappingdb',
          port: 5432,
          host: '10.10.1.37',
};

// var connectionString = require(path.join(__dirname, '../', '../', 'config'));

router.post('/api/student/', function(req, res) {
    var date = req.body.intendedStartDate;
    var data = {
        currentCollege: req.body.currentCollege,
        intendedStartDate: (date === undefined || date === null) ? 'null' : date,
    };
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        var query = client.query('INSERT INTO Student(currentCollege, intendedStartDate) values($1, $2)', [data.currentCollege, data.intendedStartDate]);
        query.on('end', function(){
            console.log('Query complete');
        }
    });
});
router.get('/api/student/', function(req, res) {
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        client.query('SELECT * FROM Student');

        var results = [];

        query.on('row', function(row){
            results.push(row);
        });

        query.on('end', function(){
            done();
            console.log('Ending...');
            return res.json(results);
        });

    });
});

router.put('/api/student/:student_id', function(req, res) {
    var id = req.params.student_id;
    var data = {
        currentCollege: req.body.currentCollege,
        intendedStartDate: (date === undefined || date === null) ? 'null' : date,
    };
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        var query = client.query("UPDATE Student currentCollege=($1), intendedStartDate=($2) WHERE id=($3)", [data.currentCollege, data.intendedStartDate, id]);
        query.on('end', function(){
            console.log('Query complete');
        }

    });
});


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
