const TEST = require("./test");

const USER = require("./user");
const PROFILE_IMAGE = require("./profilePicture");

module.exports = {
    ...TEST,
    ...USER,
    ...PROFILE_IMAGE,
}