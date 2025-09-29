import logger from "#config/logger.js";
import { createUser, login } from "#services/auth.service.js";
import { cookies } from "#utils/cookies.js";
import { formatValidationErrors } from "#utils/format.js";
import { jwtToken } from "#utils/jwt.js";
import { signInSchema, signUpSchema } from "#validations/auth.validation.js";

export const signUp = async (req, res) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: "Validation failed",
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = await jwtToken.sign({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, "token", token);

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Signup error", error);
    if (error.message == "User with this email already exists")
      return res.status(409).json({ error: "Email already exists" });
  }
  //   next(error);
};

export const signIn = async (req, res) => {
  try {
    //validate the inputs
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: "Validation failed",
        details: formatValidationErrors(validationResult.error),
      });
    }
    const { email, password } = validationResult.data;
    //login service
    const result = await login({ email, password });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error("Login failed", error);
    throw new Error("Login failed", error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  logger.info("User logged out successfully");
  return res.json({ success: true, message: "Logged out successfully" });
};
