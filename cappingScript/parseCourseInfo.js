var fs = require('fs');
var pg = require('pg');
var types = require('pg').types;

var connectionObject = {
    user: 'postgres',
    password: 'postgresCAPPING',
    database: 'cappingdb',
    port: 5432,
    host: '10.10.1.37'
};

var successNum = 0;
var dutchessID = 1;

function parseDutchessEquivalencies() {
    var data = fs.readFileSync('DCC_Courses.txt', 'utf8');
    var lines = data.split('\n');
    for (var i = 0; i < lines.length; i++){
        var line = lines[i];
        var lineObject = line.split(',');
        if (lineObject.length < 6){
            continue;
        }
        var equivObj = {
            dutchessCourseSubject : lineObject[0],
            dutchessCourseNumber  : lineObject[1].substring(0, 3),
            dutchessCourseTitle   : lineObject[2],
            maristCourseSubject   : lineObject[3],
            maristCourseNumber    : lineObject[4].substring(0, 3),
            maristCourseTitle     : lineObject[5],
        };
        var dutchessCourse = {
            courseSubject: lineObject[0],
            courseNumber:  lineObject[1].substring(0, 3),
            courseTitle:   lineObject[2],
            isAccepted:    false
        };
        dutchessCourses.push(dutchessCourse);
        equivalencies.push(equivObj);
    }
}

function parseMaristCatalog() {
    var currentMajor = '';
    var data = fs.readFileSync('catalog-test.md', 'utf8');
    var lines = data.split('\n');
    for (var i = 0; i < lines.length; i++){
        var line = lines[i].trim();
        if (line.substring(0, 1) === '#'){
            var majorTitle = line.substring(2);
            maristMajors.push(majorTitle);
            currentMajor = majorTitle;
            maristRequirements[currentMajor] = [];
        } else if (line.substring(0, 1) === '-'){
            var courseString = line.substring(2);
            var courseWords = courseString.split(' ');

            var abbrSubject = courseWords[0];
            var courseNum = courseWords[1].substring(0, 3);
            var creditsNum = courseWords[courseWords.length - 2];
            var len = courseWords.length - 2;
            if (isNaN(parseInt(creditsNum))){
                len += 2;
                creditsNum = '3';
            } else {
                for (var x = 0; x < creditsNum.length; x++){
                    var character = creditsNum.substring(x, x+1);
                    if (isNaN(parseInt(character))){
                        len += 2;
                        creditsNum = '3';
                        break;
                    }
                }
            }
            var courseTitleString = '';
            for (var j = 2; j < len; j++){
                courseTitleString += courseWords[j] + ' ';
            }
            courseTitleString = courseTitleString.trim();

            var req = {
                subject: abbrSubject,
                num: courseNum,
                credits: creditsNum,
                title: courseTitleString,
            };
            maristRequirements[currentMajor].push(req);
            allRequirements.push(req);
        }
    }
}

function cpsForEach(array, functionToApply, callback){
    cpsForEachHelper(0, array, functionToApply, callback);
}

function cpsForEachHelper(index, array, functionToApply, callback){
    if (index < array.length){
        functionToApply(array[index], function(){
            cpsForEachHelper(index + 1, array, functionToApply, callback);
        });
    } else {
        return callback();
    }
}

function equals(var1, var2){
    if (var1 === var2) return true;
    if (!(var1 instanceof Object) || !(var2 instanceof Object)) return false;
    for (var p in var1) {
        if (!var1.hasOwnProperty(p)) continue;
        if (!var2.hasOwnProperty(p)) return false;
        if (var1[p] === var2[p]) continue;
        if (typeof(var1[p]) !== "object") return false;
        if (!Object.equals(var1[p], var2[p])) return false;
    }
    for (var p in var2) {
        if (var2.hasOwnProperty(p) && !var1.hasOwnProperty(p)) return false;
    }
    return true;
}

function arrayContains(var1, arr){
    var i = arr.length;
    while (i){
        if (equals(var1, arr[i--])) return true;
    }
    return false;
}

function removeDuplicatesFromArray(arr){
    var noDups = [];
    for (var i = 0; i < arr.length; i++){
        if (!arrayContains(arr[i], noDups)) {
            noDups.push(arr[i]);
        }
    }
    return noDups;
}

var dutchessCourses = [];
var equivalencies = [];
var maristMajors = [];
var maristRequirements = {};
var allRequirements = [];

console.log('Starting data parsing...');
parseDutchessEquivalencies();
console.log('Done parsing dutchess equivalencies...');
parseMaristCatalog();
console.log('Done parsing marist catalog...');

dutchessCourses = removeDuplicatesFromArray(dutchessCourses);
equivalencies = removeDuplicatesFromArray(equivalencies);
maristMajors = removeDuplicatesFromArray(maristMajors);
allRequirements = removeDuplicatesFromArray(allRequirements);
var MRkeys = Object.keys(maristRequirements);
for(var k = 0; k < MRkeys.length; k++){
    maristRequirements[MRkeys[k]] = removeDuplicatesFromArray(maristRequirements[MRkeys[k]]);
}
console.log('Done removing duplicates...');

// Establish connection to the DB
console.log('Connecting to database...');
pg.connect(connectionObject, function(err, client, done) {
    if (err){
        console.log('Problem with pg connection: ' + err);
        client.end();
        done();
        callback();
    } else {
        // Insert dutchess courses into the DB
        console.log('Connected to ' + connectionObject.database);
        console.log('Inserting dutchess courses into the database...');
        cpsForEach(dutchessCourses, function(course, callback){
            var queryString = 'INSERT INTO Course(ScID, subject, courseNum, courseTitle, isAccepted) VALUES($1, $2, $3, $4, $5)';
            var query = client.query(queryString, [dutchessID, course.courseSubject, course.courseNumber, course.courseTitle, false]);
            query.on('end', function(){
                callback();
            });
        }, function(){
            // Insert marist majors into the DB
            console.log('Inserting majors into the database...');
            cpsForEach(maristMajors, function(major, callback2){
                var queryString = 'INSERT INTO Major(title) VALUES($1)';
                var query = client.query(queryString, [major]);
                query.on('end', function(){
                    callback2();
                });
            }, function(){
                // Insert all of the requirements (check to make sure it isnt there yet)
                console.log('Inserting requirements into the database...');
                cpsForEach(allRequirements, function(req, callback3){
                    var queryString = 'INSERT INTO Requirement(subject, courseNum, creditValue, courseTitle) VALUES($1, $2, $3, $4)';
                    var query = client.query(queryString, [req.subject, req.num, req.credits, req.title]);
                    // TODO Check here
                    query.on('end', function(){
                        callback3();
                    });
                }, function(){
                    // Insert all maristRequirements (look up each in the DB to make sure we have the correct id)
                    console.log('Inserting maristRequirements into the database...');
                    cpsForEach(Object.keys(maristRequirements), function(major, callback4){
                        cpsForEach(maristRequirements[major], function(mreq, callback5){
                            var majorID;
                            var queryString1 = 'SELECT * FROM Major WHERE Major.title = ($1)';
                            var query1 = client.query(queryString1, [major]);
                            query1.on('row', function(row){
                                majorID = row.mid;
                            });
                            query1.on('end', function(){
                                var requirementID;
                                var queryString2 = 'SELECT * FROM Requirement WHERE' + 
                                    ' Requirement.subject = ($1) AND' + 
                                    ' Requirement.courseNum = ($2) AND' + 
                                    ' Requirement.creditValue = ($3) AND' + 
                                    ' Requirement.courseTitle = ($4)'; 
                                var query2 = client.query(queryString2, [mreq.subject, mreq.num, mreq.credits, mreq.title]);
                                query2.on('row', function(row){
                                    requirementID = row.rid;
                                });
                                query2.on('end', function(){
                                    var queryString3 = 'INSERT INTO MajorRequirement(MID, RID) SELECT $1, $2 ' +
                                    'WHERE NOT EXISTS(SELECT * FROM MajorRequirement WHERE ' +
                                    'MajorRequirement.MID = ($1) AND MajorRequirement.RID = ($2))';
                                    var query3 = client.query(queryString3, [majorID, requirementID]);
                                    query3.on('end', function(){
                                        callback5();
                                    });
                                });
                            });
                        }, callback4);
                    }, function(){
                        // Insert each equivalency (check to get the id)
                        console.log('Inserting all of the course equivalencies into the database (' + equivalencies.length + ' total)...');
                        cpsForEach(equivalencies, function(eq, callback6){
                            var CID;
                            var queryString1 = 'SELECT * FROM Course WHERE' +
                                ' Course.subject = ($1) AND' + 
                                ' Course.courseNum = ($2) AND' + 
                                ' Course.courseTitle = ($3)';
                            var query1 = client.query(queryString1, [eq.dutchessCourseSubject, eq.dutchessCourseNumber, eq.dutchessCourseTitle]);
                            query1.on('row', function(row){
                                CID = row.cid;
                            });
                            query1.on('end', function(){
                                var RID;
                                var queryString2 = 'SELECT * FROM Requirement WHERE' +
                                    ' Requirement.subject = ($1) AND' + 
                                    ' Requirement.courseNum = ($2)';
                                    // ' Requirement.courseNum = ($2) AND' + 
                                    // ' Requirement.courseTitle = ($3) AND' +  
                                // var query2 = client.query(queryString2, [eq.maristCourseSubject, eq.maristCourseNumber, eq.maristCourseTitle]);
                                // for(var z = 0; z < allRequirements.length; z++){
                                //     var require = allRequirements[z];
                                //     if(require.subject === eq.maristCourseSubject && require.num === eq.maristCourseNumber){
                                //         console.log('Should be a thing: ' + JSON.stringify(require) + ', ' + JSON.stringify(eq));
                                //     }
                                // }
                                var query2 = client.query(queryString2, [eq.maristCourseSubject, eq.maristCourseNumber]);
                                query2.on('row', function(row){
                                    RID = row.rid;
                                });
                                query2.on('end', function(){
                                    if (CID === undefined || RID === undefined || CID === null || RID === null){
                                        return callback6();
                                    } else {
                                        successNum++;
                                        var insertQueryString = 'INSERT INTO Equivalent(CID, RID) SELECT $1, $2 WHERE NOT EXISTS(SELECT * FROM Equivalent' + 
                                        ' WHERE Equivalent.CID = ($1) AND Equivalent.RID = ($2))';
                                        var insertQuery = client.query(insertQueryString, [CID, RID]);
                                        insertQuery.on('end', function(){
                                            callback6();
                                        });
                                    }
                                });
                            });
                        }, function(){
                            console.log('Success count: ' + successNum);
                            console.log('Done with database interaction, disconnecting...');
                            client.end();
                            done();
                        });
                    });
                });
            });
        });
    }
});

