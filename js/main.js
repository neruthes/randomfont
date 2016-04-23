var app = {};

app.devicePixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;

app.setTransitionalElementsOpacity = function (op_) {
    var transitionalElements = document.getElementsByClassName('js-TransitionalElement');
    for (var i = 0; i < transitionalElements.length; i++) {
        transitionalElements[i].style.opacity = op_;
    };
};

app.pickRandomly = function (arr) {
    return arr[ Math.floor(Math.random()*arr.length) ];
};

app.request = function (url, callback) {
	var http = new XMLHttpRequest();
	http.open('GET', url, true);
	http.onload = callback ? callback : (function(){});
	http.send();
};

app.getFontSampleImageUrl = function (data) {
    var imgWidth = Math.floor(document.getElementById('js-FontSampleImage-container').offsetWidth*0.76) * app.devicePixelRatio;
    imgWidth = 3000;
    var fontSampleImageUrl = 'http://apicdn.myfonts.net/v1/fontsample?id=_FID_&idtype=familyid&text=_TEXT_&fg=FFFFFF&format=png&transparent=true&size=150&width=_WIDTH_&behaviour=resize'.replace(/_WIDTH_/, imgWidth).replace(/_FID_/, data.id).replace(/_TEXT_/, encodeURI(data.familyName));
    console.log(fontSampleImageUrl);
    return fontSampleImageUrl;
};

app.cacheFile = function (url) {
    app.request(url);
};

app.generateDomForDesigners = function (arr) {
    return arr.map(function (ele) {
        return '<span style="display: block;"><a class="dynamic-color" href="_URL_" target="_blank" rel="nofollow">_NAME_</a></span>'.replace(/_NAME_/g, ele.name).replace(/_URL_/g, ele.url);
    }).join('');
};

app.renderPage = function (data) {
    console.log(data);
    document.getElementById('js-PurchaseLink').href = data.url + '?refby=joyneop';
    var theRandomColor = app.pickRandomly(app.gayradientColors).match(/#[0-9A-F]{6}/)[0];
    document.getElementById('css-FontMetadata-anchor-hover').innerHTML = 'a.dynamic-color:hover { border-bottom: 2px solid _COLOR_; }'.replace(/_COLOR_/, theRandomColor);
    document.getElementById('js-FontDesigner').innerHTML = app.generateDomForDesigners(data.designer);
    document.getElementById('js-FontPublisher').innerHTML = '<a class="dynamic-color" href="_URL_" target="_blank" rel="nofollow">_NAME_</a>'.replace(/_NAME_/g, data.foundry.name).replace(/_URL_/g, data.foundry.url);
    document.getElementById('js-BriefArticleContent').innerHTML = '<p>' + data.description.join('</p><p>') + '</p>';
    document.getElementById('js-FontSampleImage-container').style.background = theRandomColor;
    var fontSampleImageUrl = app.getFontSampleImageUrl(data);
    window.setTimeout(function () {
        document.getElementById('js-FontSampleImage').setAttribute('src', fontSampleImageUrl);
    }, 255);
    app._currentFont = data;
    app._currentFontName = data.familyName;
    delete app._nextFont;
    delete app._nextFontName;
    window.setTimeout(function () {
        app.setTransitionalElementsOpacity(1);
    }, 550);
};

app.getNextFont = function () {
    app._nextFont_name = app.pickRandomly(app._listOfFonts);
    while (app._nextFont_name === app._currentFont_name) {
        app._nextFont_name = app.pickRandomly(app._listOfFonts);
    };
    app.request('/backend/data/_F_.json'.replace(/_F_/, app._nextFont_name.replace(/\s/g, '_')), function (ev_) {
        app._nextFont = JSON.parse(ev_.target.responseText);
        app.cacheFile(app.getFontSampleImageUrl(app._nextFont));
    });
};

app.__specifyNextFont = function (ffname) {
    app._nextFont_name = ffname ? ffname : 'Museo Sans Rounded';
    app.request('/backend/data/_F_.json'.replace(/_F_/, app._nextFont_name.replace(/\s/g, '_')), function (ev_) {
        app._nextFont = JSON.parse(ev_.target.responseText);
        app.cacheFile(app.getFontSampleImageUrl(app._nextFont));
    });
};

window.addEventListener('load', function () {
    app.request('/backend/gay.json', function (ev) {
        app.gayradientColors = JSON.parse(ev.target.responseText);
        app.request('/backend/raw-families-list.json', function (ev_) {
            app._listOfFonts = JSON.parse(ev_.target.responseText);
            app._currentFont_name = app.pickRandomly(app._listOfFonts);
            app.request('/backend/data/_F_.json'.replace(/_F_/, app._currentFont_name.replace(/\s/g, '_')), function (ev__) {
                app._currentFont = JSON.parse(ev__.target.responseText);
                app.renderPage(app._currentFont);
                app.getNextFont();
            });
            // todo: Cache all files
        });
    });

    document.getElementById('js-GetAnotherFont').addEventListener('click', function () {
        // app.__specifyNextFont();app.renderPage(app._nextFont); // For debug only
        app.setTransitionalElementsOpacity(0);
        if (app._nextFont) {
            app.renderPage(app._nextFont);
            app.getNextFont();
        };
    });
});
