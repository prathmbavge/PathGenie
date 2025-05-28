import React, { useState } from "react";
import GradientInput from "../Input/GradientInput";
import SlideButton from "../Buttons/SlideButton";
import { userLogin, userRegister } from "../../api/authApi.js";
import { FaUserPlus } from "react-icons/fa";
import { GrLogin } from "react-icons/gr";

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
      const authAction = isLogin ? userLogin : userRegister;
      await authAction(formData, setErrors);
      // Handle successful login/registration (e.g., navigate to dashboard)
      console.log(`${isLogin ? "Login" : "Registration"} successful`);
    } catch (error) {
      console.error(`${isLogin ? "Login" : "Registration"} error:`, error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "An unexpected error occurred.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-3 rounded-lg shadow-md">
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

      <div className="text-center border-b-2 pb-3">
        <SlideButton
          type="button"
          text={isLogin ? "Login" : "Register"}
          icon={isLogin ? <GrLogin /> : <FaUserPlus />}
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
      placeholders={[`${placeholder}`]}
      className="w-full mt-1"
      required={required}
      duration={10000}
    />
    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
  </div>
);

export default AuthForm;