import React from 'react';
import styled from 'styled-components';

const Pattern = ({children}) => {
  return (
    <StyledWrapper>
      <div className="container min-w-screen">
        {children}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    width: 100%;
    height: 100%;
    min-height: 100vh;
    background: linear-gradient(
        30deg,
        #000000 12%,
        transparent 12.5%,
        transparent 87%,
        #000000 87.5%,
        #000000
      ),
      linear-gradient(
        150deg,
        #000000 12%,
        transparent 12.5%,
        transparent 87%,
        #000000 87.5%,
        #000000
      ),
      linear-gradient(
        30deg,
        #000000 12%,
        transparent 12.5%,
        transparent 87%,
        #000000 87.5%,
        #000000
      ),
      linear-gradient(
        150deg,
        #000000 12%,
        transparent 12.5%,
        transparent 87%,
        #000000 87.5%,
        #000000
      ),
      linear-gradient(
        60deg,
        #33333333 25%,
        transparent 25.5%,
        transparent 75%,
        #33333333 75%,
        #33333333
      ),
      linear-gradient(
        60deg,
        #33333333 25%,
        transparent 25.5%,
        transparent 75%,
        #33333333 75%,
        #33333333
      );
    background-position:
      0 0,
      0 0,
      40px 70px,
      40px 70px,
      0 0,
      40px 70px;
    background-color: #000000;
    background-size: 80px 140px;
    box-shadow:
      inset 0 0 150px rgba(255, 255, 255, 0.15),
      inset 0 0 30px rgba(255, 255, 255, 0.3),
      0 0 50px rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
  }

  .container::after {
    content: "";
    position: absolute;
    top: -150%;
    left: -20%;
    right: -20%;
    bottom: -150%;
    background: linear-gradient(
    110deg,
      transparent 48%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 52%
    );
    animation: mirror-effect 4s infinite linear;
    pointer-events: none;
    transform: rotate(30deg);
  }

  @keyframes mirror-effect {
    0% {
      transform: translateY(-100%) rotate(50deg);
    }
    100% {
      transform: translateY(100%) rotate(10deg);
    }
  }
`;

export default Pattern; 