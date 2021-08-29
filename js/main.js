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
    var fontSampleImageUrl = 'https://apicdn.myfonts.net/v1/fontsample?id=_FID_&idtype=familyid&text=_TEXT_&fg=FFFFFF&bg=000000&format=png&transparent=true&size=150&width=_WIDTH_&behaviour=resize'.replace(/_WIDTH_/, imgWidth).replace(/_FID_/, data.id).replace(/_TEXT_/, encodeURI(data.familyName));
    console.log(fontSampleImageUrl);
    return fontSampleImageUrl;
};

app.generateDomForDesigners = function (arr) {
    return arr.map(function (ele) {
        return '<span style="display: block;"><a class="hover--magic-underlined" href="_URL_" target="_blank" rel="nofollow">_NAME_</a></span>'.replace(/_NAME_/g, ele.name).replace(/_URL_/g, ele.url);
    }).join('');
};

app.colorParser = function (colorStr) {
    if (colorStr.indexOf('rgb(') === 0) {
        // CSS hex mode
        var colorArr = colorStr.replace('rgb(', '').replace(')', '').split(', ');
        return {
            r: Number(colorArr[0]),
            g: Number(colorArr[1]),
            b: Number(colorArr[2])
        };
    } else if (colorStr.indexOf('#') === 0) {
        // RGB function mode
        var colorArr = [ colorStr.slice(1, 3), colorStr.slice(3, 5), colorStr.slice(5, 7) ];
        return {
            r: parseInt(colorArr[0], 16),
            g: parseInt(colorArr[1], 16),
            b: parseInt(colorArr[2], 16)
        };
    } else {
        // Error
        return {
            r: 0,
            g: 0,
            b: 0
        };
    };
};

app.colorEncoder = function (colorObj) {
    // var colorObj = { r: 12, g: 222, b: 148 };
    return 'rgb(R, G, B)'.replace(/[RGB]/g, function (arg1) {
        return colorObj[ arg1.toLowerCase() ];
    })
};

app.colorDarken = function (co) {
    var _darken = function (c) {
        var _dc = 32;
        return (c - _dc >= 0) ? c - _dc : 0;
    };
    return {
        r: _darken(co.r),
        g: _darken(co.g),
        b: _darken(co.b)
    }
};

app.renderPage = function (data) {
    console.log(data);
    if (data.designer.length === 1) {
        document.getElementById('js-Caption-Designer').innerHTML = 'DESIGNER';
    } else {
        document.getElementById('js-Caption-Designer').innerHTML = 'DESIGNERS';
    };
    document.getElementById('js-PurchaseLink').href = data.url + '?refby=joyneop';
    window.theRandomColor = app.pickRandomly(app.gayradientColors).match(/#[0-9A-F]{6}/)[0];
    // document.getElementById('css-FontMetadata-anchor-hover').innerHTML = 'a.hover--magic-underlined:hover { border-bottom: 2px solid _COLOR_; }'.replace(/_COLOR_/, theRandomColor);
    document.getElementById('js-FontDesigner').innerHTML = app.generateDomForDesigners(data.designer);
    document.getElementById('js-FontPublisher').innerHTML = '<a class="hover--magic-underlined" href="_URL_" target="_blank" rel="nofollow">_NAME_</a>'.replace(/_NAME_/g, data.foundry.name).replace(/_URL_/g, data.foundry.url);
    document.getElementById('js-BriefArticleContent').innerHTML = '<p>' + data.description.join('</p><p>') + '</p>';
    document.body.style.backgroundColor = theRandomColor;
    document.getElementById('js-ColorBackground').style.backgroundColor = theRandomColor;
    var fontSampleImageUrl = app.getFontSampleImageUrl(data);
    window.setTimeout(function () {
        document.getElementById('js-FontSampleImage').setAttribute('src', fontSampleImageUrl);
    }, 255);
    app._currentFont = data;
    app._currentFontName = data.familyName;
    window.setTimeout(function () {
        app.setTransitionalElementsOpacity(1);
    }, 550);
};

app.getMaxFontId = function () {
    var metaTag = document.querySelectorAll('meta[name="app-fonts-count-20160506DI"]')[0];
    return Number(metaTag.getAttribute('content'));
};

app.pickRandomNumberUpTo = function (upperBoundary) {
    return Math.floor(Math.random()*(1+upperBoundary));
};

window.addEventListener('load', function () {
    app.request('./backend/gay.json', function (ev) {
        app.gayradientColors = JSON.parse(ev.target.responseText);

        app._currentFont_id = app.pickRandomNumberUpTo(app.getMaxFontId());
        app.request('./backend/data2/_F_.json'.replace(/_F_/, app._currentFont_id), function (ev_) {
            app._currentFont = JSON.parse(ev_.target.responseText);
            app.renderPage(app._currentFont);
            document.getElementById('js-expand').addEventListener('click', function () {
                document.getElementById('js-expand').style.display = 'none';
                document.getElementById('js-PoweredByMyFonts').classList.remove('hide-when-parent-hover');
                document.getElementById('js-additional').style.display = 'block';
                window.scrollTo(0, document.getElementById('js-additional').offsetTop + document.getElementById('js-additional').offsetHeight + window.innerHeight);
            });
        });

    });
});
