import jwt from "jsonwebtoken"; // Make sure `jsonwebtoken` is installed

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const sign = (payload, secret = JWT_SECRET, options = {}) => {
    return jwt.sign(payload, secret, options);
};

const verify = (token, secret = JWT_SECRET) => {
    return jwt.verify(token, secret);
};

export default { sign, verify };
