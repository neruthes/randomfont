/*
(c) 2016 Joy Neop. All rights reserved.
*/

// Environments

var ___forceUpdatingEnabled = Boolean( ['-f', '--force'].indexOf(process.argv[2]) !== -1 );

// Include Modules

var fs = require('fs');
var request = require('request');
var db = require('./database.js');

var database = db.createDatabase( JSON.parse(fs.readFileSync(__dirname + '/database.json').toString()) );
database.whenAllUpdated(function () {
    var jsonText = JSON.stringify(database.data);
    // console.log('\n\n---------------------------------\nUpdated database:\n');
    // console.log(jsonText);
    console.log('\n\nDatabase updated!\n');
    fs.writeFileSync(__dirname + '/database.json', jsonText);
});

var appKey = fs.readFileSync('/Users/JoyNeop/myfonts-appkey.txt').toString();
var listJson = JSON.parse(fs.readFileSync(__dirname + '/raw-families-list.json').toString());

// Find diff between `raw-families-list.json` and `database.json` and add the missing rows

listJson.map(function (fontFamily) {
    if (___forceUpdatingEnabled || !database.select(fontFamily)) {
        request.get('http://api.myfonts.net/v1/family?api_key=_APP_KEY_&name=_FAMILY_NAME_'.replace(/_APP_KEY_/, appKey).replace('_FAMILY_NAME_', fontFamily), function (err, res, body) {
            if (err) {
                throw err;
            } else {
                var r = JSON.parse(body);
                if (r.total_results === 0) {
                    console.log('_FAMILY_NAME_ Not Found!'.replace(/_FAMILY_NAME_/, fontFamily));
                    database.receiveUpdating();
                } else {
                    var fontId = Object.keys(r.results)[0];
                    request.get('http://api.myfonts.net/v1/family?api_key=_APP_KEY_&id=_FID_&extra_data=meta|details|article_abstract'.replace(/_APP_KEY_/, appKey).replace(/_FID_/, fontId), function (err_, res_, body_) {
                        var r1 = JSON.parse(body_);
                        var fontObj = {
                            'id': fontId,
                            'familyName': r.results[fontId].name,
                            'foundry': r1.results[fontId].foundry[0],
                            'designer': r1.results[fontId].designers,
                            'description': r1.results[fontId].article_abstract,
                            'url': r.results[fontId].url
                        };
                        if (___forceUpdatingEnabled) {
                            database.delete(fontFamily);
                        };
                        database.insert(fontFamily, fontObj);
                        console.log('\n:) Loaded ' + fontFamily + '\n');
                        console.log(fontObj);
                        database.receiveUpdating();
                    });
                };
            };
        });
    } else {
        database.receiveUpdating();
    };
});

// Generate

Object.keys(database.data).map(function (fontFamily, ind) {
    var jsonText = JSON.stringify(database.select(fontFamily));
    fs.writeFileSync(__dirname + '/data2/_FONT_FAMILY_ID_.json'.replace(/_FONT_FAMILY_ID_/, ind), jsonText);
});

// Validation

Object.keys(database.data).map(function (fontFamily) {
    var fontData = database.select(fontFamily);
    if (!fontData.designer) {
        console.log('!! ' + fontFamily + ' does not have designer');
    };
    if (!fontData.description) {
        console.log('!! ' + fontFamily + ' does not have description');
    };
});

// HTML meta tag

(function (html) {
    fs.writeFileSync(__dirname + '/../index.html', html.replace(/(<meta name="app-fonts-count-20160506DI" content=")\d+"/, '$1_"'.replace(/_/, Object.keys(database.data).length-1)));
})(fs.readFileSync(__dirname + '/../index.html').toString());
