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

// New student
router.post('/api/student/', function(req, res) {
    var date = req.body.intendedStartDate;
    var data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.pass,
        accessLevel: req.body.accessLevel,
        currentCollege: req.body.currentCollege,
        intendedStartDate: (date === undefined || date === null) ? 'null' : date,
    };
    console.log(data);
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        var userQuery = client.query('INSERT INTO Users(firstName, lastName, email, pass, accessLevel) values($1,$2,$3,$4,$5)',
                [data.firstName, data.lastName, data.email, data.password, data.accessLevel]);
        userQuery.on('end', function(){
            var idQuery = client.query('SELECT UID FROM Users WHERE email = \'' + data.email + '\'');
            var idObj = null;
            idQuery.on('row', function(row){
                idObj = row;
            });
            idQuery.on('end', function(){
                var studentQuery = client.query('INSERT INTO Student(StID, currentCollege, intendedStartDate) values($1, $2, $3)',
                        [idObj.uid, data.currentCollege, data.intendedStartDate]);
                studentQuery.on('end', function(){
                    done();
                    client.end();
                    return res.json(idObj);
                });
            });
        });
    });
});

// Get a student
router.get('/api/student/:student_id', function(req, res) {
    pg.connect(connectionObject, function(err, client, done){
        var id = req.params.student_id;
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        client.query('SELECT * FROM Student WHERE StID = ($1)', [id]);

        var results = [];

        query.on('row', function(row){
            results.push(row);
        });

        query.on('end', function(){
            client.end();
            done();
            return res.json(results);
        });

    });
});

// Update a student
router.put('/api/student/:student_id', function(req, res) {
    var id = req.params.student_id;
    var data = {
        currentCollege: req.body.currentCollege,
        intendedStartDate: (date === undefined || date === null) ? 'None' : date,
    };
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        var query = client.query("UPDATE Student currentCollege=($1), intendedStartDate=($2) WHERE id=($3)", [data.currentCollege, data.intendedStartDate, id]);
        query.on('end', function(){
            client.end();
            done();
            return res.json(id);
        });

    });
});

// Delete a student
router.delete('/api/student/:student_id', function(req, res){
    var id = req.params.student_id;
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        client.query('DELETE FROM Student WHERE StID = ($1)', [id]);

        query.on('end', function(){
            client.end();
            done();
            return res.json(results);
        });

    });
})

// Get all courses
router.get('/api/courses/', function(req, res) {
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        var results = []
        var query = client.query('SELECT * FROM Courses');
        query.on('row', function(row){
            results.push(row);
        });
        query.on('end', function(){
            client.end();
            done();
            return res.json(results);
        });
    });
});

// Get Majors
router.get('/api/majors/', function(req, res) {
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        var results = []
        var query = client.query('SELECT * FROM Major');
        query.on('row', function(row){
            results.push(row);
        });
        query.on('end', function(){
            client.end();
            done();
            return res.json(results);
        });
    });
});

// Get all requirements
router.get('/api/requirements/', function(req, res) {
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        var results = []
        var query = client.query('SELECT * FROM Requirement');
        query.on('row', function(row){
            results.push(row);
        });
        query.on('end', function(){
            client.end();
            done();
            return res.json(results);
        });
    });
});

// Get requirements for a specific major
router.get('/api/requirements/majors/:major_id', function(req, res) {
    var id = req.params.major_id;
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        var results = []
        var query = client.query('SELECT * FROM Requirement INNER JOIN MajorRequirement on (Requirement.RID = MajorRequirement.RID)' + 
                ' INNER JOIN Major on (Major.MID = MajorRequirement.MID) WHERE Major.MID = ($1)', [id]);
        query.on('row', function(row){
            results.push(row);
        });
        query.on('end', function(){
            client.end();
            done();
            return res.json(results);
        });
    });
});

// Get equivalencies for major and student
router.get('/api/equivalencies/major/:major_id/student/:student_id', function(req, res) {
    var mid = req.params.major_id;
    var stid = req.params.student_id;
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        var results = []
        var query = client.query('SELECT * FROM Requirement INNER JOIN MajorRequirement on (Requirement.RID = MajorRequirement.RID)' + 
                ' ',
                [mid, stid]);
        query.on('row', function(row){
            results.push(row);
        });
        query.on('end', function(){
            client.end();
            done();
            return res.json(results);
        });
    });
});

// Add a course for a student
router.post('/api/student/:student_id/courses/:course_id', function(req, res) {
    var stid = req.params.student_id;
    var cid = req.params.course_id;
    pg.connect(connectionObject, function(err, client, done){
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        var query = client.query('INSERT INTO CoursesTaken(StID, CID) VALUES($1, $2)', [stid, cid]);
        query.on('end', function(){
            client.end();
            done();
            return res.json([stid, cid]);
        });
    });
});

// Get all of the student's courses
router.get('/api/student/:student_id/courses/', function(req, res) {
    pg.connect(connectionObject, function(err, client, done){
        var id = req.params.student_id;
        if(err){
            console.log(err);
            return res.status(500).json({success: false, data: err});
            done();
        }
        client.query('SELECT * FROM Course INNER JOIN CoursesTaken on (Course.CID = CoursesTaken.CID) INNER JOIN Student on (Student.StID = Course.StID) WHERE StID = ($1)', [id]);

        var results = [];

        query.on('row', function(row){
            results.push(row);
        });

        query.on('end', function(){
            client.end();
            done();
            return res.json(results);
        });
    });
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
