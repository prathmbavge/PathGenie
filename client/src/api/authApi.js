import { signIn, signUp } from "../lib/auth-client";
import constants from "../../constants";

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