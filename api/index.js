const TEST = require("./test");

const USER = require("./user");
const PROFILE_IMAGE = require("./profilePicture");
const NOTE = require("./note");
const MIDDLEWARE = require("./middleware");
const NOTE_FILE = require("./noteFile")

const CSV = require("./csv")

module.exports = {
    ...TEST,
    ...USER,
    ...PROFILE_IMAGE,
    ...NOTE,
    ...MIDDLEWARE,
    ...NOTE_FILE,
    ...CSV,
}