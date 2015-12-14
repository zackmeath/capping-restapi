
var pg = require('pg');
var connectionObject = {
    user: 'postgres',
    password: 'postgresCAPPING',
    database: 'cappingdb',
    port: 5432,
    host: '10.10.1.37'
};

var dutchessID = 1;

pg.connect(connectionObject, function(err, client, done) {
    if (err){
        console.log('Problem with pg connection: ', err);
        client.end();
        done();
    } else {
        var deleteQueryString = 'DELETE FROM MajorRequirement;' +
            ' DELETE FROM Equivalent;' +
            ' DELETE FROM CoursesTaken;' +
            ' DELETE FROM StudentMajors;' +
            ' DELETE FROM Student;' +
            ' DELETE FROM Requirement;' +
            ' DELETE FROM Major;' +
            ' DELETE FROM Course;';
        var deleteQuery = client.query(deleteQueryString, []);
        deleteQuery.on('end', function(){
            queryString = 'INSERT INTO School(ScName) VALUES($1)';
            query = client.query(queryString, ['Dutchess Community College']);
            query.on('end', function(){
                queryString = 'SELECT * FROM School WHERE School.ScName = ($1)';
                query2 = client.query(queryString, ['Dutchess Community College']);
                query2.on('row', function(row){
                    dutchessID = parseInt(row.ScID);
                });
                query2.on('end', function(){
                    client.end();
                    done();
                });
            });
        });
    }
});
