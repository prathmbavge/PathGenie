import React from "react";
import styled from "styled-components";
// import PropTypes from "proptypes";

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

const GradientInput = ({
   id,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "Type something intelligent",
  required = false,
  style,
  className, }) => {
  return (
    <FormControl>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={className}
        style={{
          "--border-before-color": "rgba(255, 255, 255, 0.2)",
          "--border-height": "2px",
          ...style,
        }}
      />
      <InputBorder />
    </FormControl>
  );
};

// GradientInput.propTypes = {
//   id: PropTypes.string,
//   name: PropTypes.string,
//   type: PropTypes.string,
//   value: PropTypes.string,
//   onChange: PropTypes.func,
//   placeholder: PropTypes.string,
//   required: PropTypes.bool,
//   style: PropTypes.object,
//   className: PropTypes.string,
// };

export default GradientInput;