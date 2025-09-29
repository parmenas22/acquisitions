import logger from "#config/logger.js";
import bcrypt from "bcrypt";
import { db } from "#config/database.js";
import { eq } from "drizzle-orm";
import { jwtToken } from "#utils/jwt.js";
import { users } from "#models/user.model.js";

export const hashPassword = async (password) => {
  try {
    return bcrypt.hash(password, 10);
  } catch (error) {
    logger.error("Error hashing the password", error);
    throw new Error("Error hashing the password");
  }
};

export const verifyPassword = async (password, hashPassword) => {
  try {
    return bcrypt.compare(password, hashPassword);
  } catch (error) {
    throw new Error("Error comparing password", error);
  }
};
export const createUser = async ({ name, email, password, role = "user" }) => {
  try {
    //confirm if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if ((await existingUser).length > 0) throw new Error("User already exists");

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: passwordHash, role })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      });

    logger.info(`User created successfully : ${newUser}`);
    return newUser;
  } catch (error) {
    logger.error("Error creating the user", error);
    throw new Error("Error creating the user");
  }
};

export const login = async ({ email, password }) => {
  try {
    //confirm that the email exists

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length == 0) {
      logger.info("User with this email does not exist");
      return {
        success: false,
        message: "User with this email does not exist",
      };
    }
    const user = existingUser[0];

    //compare the passwords
    const isPasswordMatch = await verifyPassword(password, user.password);
    if (!isPasswordMatch) {
      logger.info("Incorrect credentials");
      return {
        success: false,
        message: "Incorrect credentials",
      };
    }

    //create the token
    const token = jwtToken.sign({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    //
    logger.info("User signed in successfully");
    return {
      success: true,
      message: "User signed in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    logger.error("Login failed", error);
    throw new Error("Login failed", error);
  }
};
