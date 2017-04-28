"use strict";
const Promise = require('bluebird');

class Validator {
    constructor(param, message) {
        this.param = param;
        this.message = message;
        this.allTest = [];
    }

    getMessage() { return this.message };

    isEmail() {
        this.test(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/);
        return this;
    }

    test(regex) {
        const func = (regex) => {
            return new Promise((resolve) => {
                regex = new RegExp(regex);
                resolve(regex.test(this.param));
            });
        };
        this.addToTest(func, [regex]);
        return this;
    }

    isUnique(dBfunc) {
        const func = (dBfunc) => {
            return new Promise((resolve, reject) => {
                dBfunc(this.param, (err, result) => {
                    if (err)
                        return reject(err);
                    resolve(!result);
                });
            })
        };
        this.addToTest(func, [dBfunc]);
        return this;
    }

    isValid() {
        let valid = true;

        return new Promise((resolve, reject) => {
            Promise.map(this.allTest, (test) => {
                //valid = test.call.apply(null, test.params) ? valid : false;
                return test.call.apply(null, test.params).then(
                    testIsValid => {
                        valid = testIsValid ? valid : false;
                    },
                    error => {
                        reject(error);
                    }
                );
             }).then(() => {
                resolve(valid);
             });
        });
    }

    addToTest(func, params) {
        params = params || [];
        let push = {
            params: params,
            call: func,
        };
        this.allTest.push(push);
    }
}

module.exports = (req, res, next) => {

    let validators = [];

    req.bodyCheck = (param, message) => {
        if (req.body[param] !== undefined)
        {
            let i = validators.push(new Validator(req.body[param], message));
            return validators[i - 1];
        }
    };

    req.isFormValid = () => {
        let isValid = true;
        let messages = [];

        return new Promise((resolve, reject) => {
            Promise.map(validators, (validator) => {
                return validator.isValid().then(
                    valid => {
                        if (!valid) {
                            isValid = false;
                            messages.push(validator.getMessage());
                        }
                        //isValid = valid ? isValid : false;
                    },
                    error => {
                        return reject(error);
                    }
                );
            }).then(() => {
                resolve({ isValid: isValid, messages: messages });
            });
        });
    };

    next();
};
