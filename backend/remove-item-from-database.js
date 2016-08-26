/*
(c) 2016 Joy Neop. All rights reserved.
*/

// Environments

var fontFamilyName = process.argv[2];

// Include Modules

var fs = require('fs');
var db = require('./database.js');

var database = db.createDatabase( JSON.parse(fs.readFileSync(__dirname + '/database.json').toString()) );

if (fontFamilyName) {
    if (database.delete(fontFamilyName)) {
        var jsonText = JSON.stringify(database.data);
        console.log('\n\nDatabase updated!\n');
        fs.writeFileSync(__dirname + '/database.json', jsonText);
    } else {
        console.log('\n\nNo such record!\n');
    };
} else {
    console.log('\n\nFont family not specified!\n');
}
