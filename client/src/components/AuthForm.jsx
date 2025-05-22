import React, { useState } from "react";
import GradientInput from "../components/Input/GradientInput";
import SlideButton from "../components/Buttons/SlideButton";
import { signIn, signUp } from "../lib/auth-client";
import ArrowIcon from '../components/Icons/ArrowIcon';
import LoginIcon from '../components/Icons/LoginIcon';
import constants from "../../constants";

const AuthForm = ({ isLogin = false }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    passwordMatch: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "password" || name === "confirmPassword"
        ? { passwordMatch: "" }
        : {}),
      general: "",
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!isLogin && !formData.username)
      newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!isLogin && formData.password !== formData.confirmPassword)
      newErrors.passwordMatch = "Passwords do not match";

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await signIn.email(
          {
            email: formData.email,
            password: formData.password,
            callbackURL: `${constants.mode === 'production' ? '' : `${constants.clientUrl}`}/dashboard`,
          },
          {
            onError: (error) => {
              setErrors((prev) => ({
                ...prev,
                general: error.error.message,
              }));
            },
          }
        );
        console.log("User logged in successfully:", { email: formData.email });
      } else {
        await signUp.email(
          {
            email: formData.email,
            password: formData.password,
            name: formData.username,
            callbackURL: `${constants.mode === 'production' ? '' : `${constants.clientUrl}`}/profile`,
          },
          {
            onError: (error) => {
              setErrors((prev) => ({
                ...prev,
                general: error.error.message,
              }));
            },
          }
        );
        console.log("Trying User registration:", {
          email: formData.email,
          username: formData.username,
        });
      }
    } catch (error) {
      console.error(
        `${isLogin ? "Login" : "Registration"} failed:`,
        error.message
      );
      setErrors((prev) => ({
        ...prev,
        general: `${
          isLogin ? "Login" : "Registration"
        } failed. Please try again.`,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLogin ? (
        <>
          <InputField
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
            error={errors.email}
            fullWidth={true}
          />
          <InputField
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
            error={errors.password}
            fullWidth={true}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-4">
            <InputField
              label="Email"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              error={errors.email}
              fullWidth={false}
            />
            <InputField
              label="Username"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              error={errors.username}
              fullWidth={false}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-4">
            <InputField
              label="Password"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              error={errors.password}
              fullWidth={false}
            />
            <InputField
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              error={errors.passwordMatch}
              fullWidth={false}
            />
          </div>
        </>
      )}

      {errors.general && (
        <div className="text-red-500 text-sm text-center">{errors.general}</div>
      )}

      <div className="text-center border-b-2 border-gray-300 pb-3 border-x-2">
        <SlideButton
          type="button"
          text={isLogin ? "Login" : "Register"}
          icon={isLogin ? <LoginIcon /> : <ArrowIcon />}
          fullWidth={true}
          disabled={isSubmitting}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
};

const InputField = ({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  fullWidth = false,
}) => (
  <div
    className={`transition-all duration-300 ${
      fullWidth ? "w-full" : "w-full sm:w-1/2"
    }`}
  >
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 dark:text-white"
    >
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <GradientInput
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full"
      required={required}
    />
    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
  </div>
);



export default AuthForm;
