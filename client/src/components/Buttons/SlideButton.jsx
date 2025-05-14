import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  position: relative;
  display: inline-block;
  cursor: pointer;
  outline: none;
  background: transparent;
  padding: 0;
  font-size: inherit;
  font-family: inherit;
  width: 12rem;
  height: auto;

  /* Base border via pseudo-element */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid #fefefe;
    box-sizing: border-box;
    z-index: 0;
  }

  /* Dark overlay highlight */
  &::after {
    content: '';
    position: absolute;
    top: 6px;
    left: -2px;
    width: calc(100% + 3px);
    height: calc(100% - 12px);
    background-color: #24355c;
    transform-origin: center;
    transform: scaleY(1);
    transition: transform 0.3s ease-in-out;
    z-index: 1;
  }

  &:hover::after {
    transform: scaleY(0);
  }

  /* Icon container with slide animation */
  .rectangle {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    width: 3rem;
    height: 3rem;
    background: #000;
    z-index: 2;
    transition: width 0.45s cubic-bezier(0.65, 0, 0.076, 1);
    overflow: hidden;
  }

  .icon-wrapper {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.5s cubic-bezier(0.65, 0, 0.076, 1);
  }

  .button-text {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.75rem 0;
    margin-left: 1.85rem;
    color: #ffffff;
    font-weight: 700;
    line-height: 1.6;
    text-align: center;
    text-transform: uppercase;
    z-index: 4;
    transition: color 0.45s cubic-bezier(0.65, 0, 0.076, 1);
  }

  &:hover {
    .rectangle {
      width: 100%;
    }

    .icon-wrapper {
      transform: translateX(calc(100% - (-4em)));
    }

    .button-text {
      color: #fff;
      letter-spacing: 0.5px;
    }
  }
`;

/**
 * SlideButton Props:
 * @param {string} text - Button label
 * @param {React.ReactNode} icon - Any React component to render as the icon
 */
const SlideButton = ({ text, icon, style, onClick }) => (
  <StyledButton style={style ? { ...style } : {}} onClick={onClick}>
    <span className="rectangle text-white" aria-hidden="true">
      {icon && <span className="icon-wrapper">{icon}</span>}
    </span>
    <span className="button-text">{text}</span>
  </StyledButton>
);

export default SlideButton;
