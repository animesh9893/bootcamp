const TEST = require("./test");

const USER = require("./user");
const PROFILE_IMAGE = require("./profilePicture");
const NOTE = require("./note");
const MIDDLEWARE = require("./middleware");


module.exports = {
    ...TEST,
    ...USER,
    ...PROFILE_IMAGE,
    ...NOTE,
    ...MIDDLEWARE,
}