"use strict";
const Promise = require('bluebird');

class Validator {
    constructor(req, param, message, name) {
        this.req = req.body;
        this.param = param;
        this.message = message;
        this.name = name;
        this.allTest = [];
    }

    getMessage() { return this.message };
    getName() { return this.name };

    isEmail() {
        this.test(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/);
        return this;
    }

    test(regex) {
        const func = (regex) => {
            return new Promise(resolve => {
                regex = new RegExp(regex);
                resolve(regex.test(this.value()));
            });
        };
        this.addToTest(func, [regex]);
        return this;
    }

    equalTo(equal) {
        const func = (equal) => {
            return new Promise(resolve => {
                const value = this.value();
                resolve(!this.value().localeCompare(equal));
            })
        };
        this.addToTest(func, [equal]);
        return this;
    }

    isRequired() {
        const func = () => {
            return new Promise(resolve => {
                resolve(this.value() !== '');
            });
        };
        this.addToTest(func);
        return this;
    }

    isIn(array) {
        const func = (array) => {
            return new Promise(resolve => {
                resolve(array.indexOf(this.value()) !== -1)
            });
        };
        this.addToTest(func, [array]);
        return this;
    }

    isDate() {
        const func = () => {
            return new Promise(resolve => {
                resolve(!isNaN(Date.parse(this.value())))
            });
        };
        this.addToTest(func);
        return this;
    }

    isUnique(dBfunc) {
        const func = (dBfunc) => {
            return new Promise((resolve, reject) => {
                dBfunc(this.value(), (err, result) => {
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
        return new Promise((resolve, reject) => {
            Promise.map(this.allTest, (test) => {
                //valid = test.call.apply(null, test.params) ? valid : false;
                return test.call.apply(null, test.params).then(
                    testIsValid => {
                        if (testIsValid === false)
                            resolve(false);
                    },
                    error => {
                        reject(error);
                    }
                );
             }).then(() => {
                resolve(true);
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

    value() {
        return this.req[this.param] || '';
    }
}

module.exports = (req, res, next) => {

    if (req.session._formInputs) {
        res.locals.formInputs = req.session._formInputs;
        req.session._formInputs = undefined;
    }

    if (req.session._formErrors) {
        res.locals.formErrors = req.session._formErrors;
        req.session._formErrors = undefined;
    }

    let validators = [];

    req.bodyCheck = (param, message) => {
        let i = validators.push(new Validator(req, param, message, param));
        return validators[i - 1];
    };

    req.isFormValid = () => {
        let isValid = true;
        let inputs = {};
        let errors = {};

        return new Promise((resolve, reject) => {
            Promise.map(validators, (validator) => {
                return validator.isValid().then(
                    valid => {
                        inputs[validator.getName()] = validator.value();
                        if (!valid) {
                            isValid = false;
                            if (!errors[validator.getName()]) {
                                errors[validator.getName()] = [];
                            }
                            errors[validator.getName()].push(validator.getMessage());
                        }
                    },
                    error => {
                        return reject(error);
                    }
                );
            }).then(() => {
                req.session._formInputs = inputs;
                req.session._formErrors = errors;
                resolve(isValid);
            });
        });
    };

    next();
};
