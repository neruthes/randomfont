/*
(c) 2016 Neruthes. All rights reserved.
*/

var exports = module.exports = {};

exports.createDatabase = function (arg) {
    var db = {
        data: JSON.parse(JSON.stringify(arg)),
        _updated_count: 0
    };

    db.select = function (uid) {
        if (this.data[uid]) {
            return this.data[uid];
        } else {
            return null;
        };
    };

    db.insert = function (uid, item) {
        if (this.data[uid]) {
            return {
                err: 1,
                errMessage: 'Uid already taken'
            };
        } else {
            this.data[uid] = item;
            return {
                err: 0
            };
        };
    };

    db.update = function (uid, item) {
        if (this.data[uid]) {
            this.data[uid] = item;
            return {
                err: 0
            };
        } else {
            return {
                err: 2,
                errMessage: 'Uid nonexistent'
            };
        };
    };

    db.delete = function (uid) {
        if (this.data[uid]) {
            delete this.data[uid];
            return {
                err: 0
            };
        } else {
            return {
                err: 3,
                errMessage: 'Uid nonexistent'
            };
        };
    };

    db.whenAllUpdated = function (callback) {
        this._callback_whenAllUpdated = callback;
    };

    db.receiveUpdating = function () {
        this._updated_count = this._updated_count+1;
        if (this._updated_count == Object.keys(this.data).length) {
            this._callback_whenAllUpdated();
        };
    };

    return db;
};
