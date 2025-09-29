import logger from "#config/logger.js";
import jwt from "jsonwebtoken";

const secret =
  process.env.JWT_SECRET ||
  "your-secret-key-please-do-not-expose-this-key!!!!!";

const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

export const jwtToken = {
  sign: (payload) => {
    try {
      return jwt.sign(payload, secret, { expiresIn: expiresIn });
    } catch (error) {
      logger.error("Failed to authenticate the token", error);
      throw new Error("Failed to authenticate the token");
    }
  },
  verify: (token) => {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      logger.error("Failed to authenticate the token", error);
      throw new Error("Failed to authenticate the token");
    }
  },
};
