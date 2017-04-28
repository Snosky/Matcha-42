const ejson = () => {

};

module.exports = (req, res, next) => {
    res.ejson = ejson;
    next();
};
