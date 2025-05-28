import React, { useState, useEffect } from "react";
import styled from "styled-components";

const FormControl = styled.div`
  position: relative;
  --width-of-input: 300px;
  width: 100%;
`;

const Input = styled.input`
  color: #fff;
  font-size: 1.2rem;
  background-color: transparent;
  width: 100%;
  box-sizing: border-box;
  padding-inline: 1em;
  padding-block: 0.8em;
  border: none;
  border-bottom: var(--border-height) solid var(--border-before-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const InputBorder = styled.span`
  position: absolute;
  background: linear-gradient(90deg, #ff6464 0%, #ffbf59 50%, #47c9ff 100%);
  height: 3px;
  width: 100%;
  bottom: 0;
  left: 0;
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.42, 0, 0.58, 1);

  ${Input}:hover + & {
    transform: scaleX(1);
  }
  ${Input}:focus + & {
    transform: scaleX(1);
  }
`;

const AnimatedPlaceholder = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  padding-inline: 1em;
  padding-block: 0.8em;
  color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const GradientInput = ({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholders = ["Type something intelligent", "Type something creative"],
  required = false,
  style,
  className,
  duration = 2000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
        setIsVisible(true);
      }, 300); // Delay for fade-out animation
    }, duration); // Change placeholder every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [placeholders, duration]);

  const handleFocus = () => setIsInputFocused(true);
  const handleBlur = () => setIsInputFocused(false);

  return (
    <FormControl>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder=""
        required={required}
        className={className}
        style={{
          "--border-before-color": "rgba(255, 255, 255, 0.2)",
          "--border-height": "2px",
          ...style,
        }}
      />
      {value === "" && !isInputFocused && (
        <AnimatedPlaceholder isVisible={isVisible}>
          {placeholders[currentIndex]}
        </AnimatedPlaceholder>
      )}
      <InputBorder />
    </FormControl>
  );
};

export default GradientInput;