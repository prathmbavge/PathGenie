import { signIn, signUp } from "../lib/auth-client";
import constants from "../../constants";

/**
 * Attempts to log in a user using their email and password.
 *
 * @async
 * @function userLogin
 * @param {Object} formData - The form data containing user credentials.
 * @param {string} formData.email - The user's email address.
 * @param {string} formData.password - The user's password.
 * @param {Function} setErrors - A function to set error messages.
 * @throws Will throw an error if the login process fails.
 */

export const userLogin = async (formData, setErrors) => {
  try {
    await signIn.email(
      {
        email: formData.email,
        password: formData.password,
        callbackURL: `${
          constants.mode === "production" ? "" : constants.clientUrl
        }/dashboard`,
      },
      {
        onError: (error) => {
          throw new Error(error.message || "Login failed.");
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    setErrors((prev) => ({
      ...prev,
      general: error.message || "An unexpected error occurred.",
    }));
    throw error;
  }
};

/**
 * Attempts to register a new user with the provided form data.
 *
 * @async
 * @function userRegister
 * @param {Object} formData - The form data containing user credentials.
 * @param {string} formData.email - The user's email address.
 * @param {string} formData.password - The user's password.
 * @param {string} formData.username - The user's username.
 * @param {Function} setErrors - A function to set error messages.
 * @throws Will throw an error if the registration process fails.
 */
export const userRegister = async (formData, setErrors) => {
  try {
    await signUp.email(
      {
        email: formData.email,
        password: formData.password,
        name: formData.username,
      },
      {
        onError: (error) => {
          throw new Error(error.message || "Registration failed.");
        },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    setErrors((prev) => ({
      ...prev,
      general: error.message || "An unexpected error occurred.",
    }));
    throw error;
  }
};

/**
 * Attempts to log in a user using their social media account.
 *
 * @async
 * @function userSocialSignOn
 * @param {string} provider - The social media provider name (e.g. "google", "github", etc.)
 * @param {Function} setErrors - A function to set error messages.
 * @throws Will throw an error if the sign-in process fails.
 */
export const userSocialSignOn = async (provider, setErrors) => {
  try {
    await signIn.social(
      {
        provider,
        callbackURL: `${
          constants.mode === "production" ? "" : constants.clientUrl
        }/dashboard`,
        newUserCallbackURL: `${
          constants.mode === "production" ? "" : constants.clientUrl
        }/profile`,
      },
      {
        onError: (error) => {
          throw new Error(error.message || `Failed to sign in with ${provider}.`);
        },
      }
    );
  } catch (error) {
    console.error(`${provider} sign-in error:`, error);
    setErrors((prev) => ({
      ...prev,
      general: error.message || `Failed to sign in with ${provider}.`,
    }));
    throw error;
  }
};