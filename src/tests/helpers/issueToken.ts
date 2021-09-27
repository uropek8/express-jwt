// const jwt = require("jsonwebtoken");
import * as jwt from "jsonwebtoken";

// module.exports = (data, options = {}) => jwt.sign(data, "TEST", options);
export const issueToken = (data: {}, options = {}) => jwt.sign(data, "TEST", options);
