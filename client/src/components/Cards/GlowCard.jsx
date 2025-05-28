import React from 'react';
import styled, { keyframes } from 'styled-components';



const shineSweep = keyframes`
  0% { transform: translate(-30%, -30%) rotate(0deg); }
  100% { transform: translate(-30%, -30%) rotate(360deg); }
`;

// Styled components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  position: relative;
`;



const BatteryCard = styled.div`
  position: relative;
  width: ${({ width }) => width || '280px'};
  padding: ${({ padding }) => padding || '30px'};
    height: ${({ height }) => height || '350px'};
  background: transparent;
  border: 1px solid rgba(80, 100, 200, 0.2);
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.6),
    inset 0 0 10px rgba(80, 100, 200, 0.15);
   
  overflow: hidden;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-5px);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.8),
      inset 0 0 15px rgba(80, 100, 200, 0.25);
    filter: brightness(0.5);
    .diagonal {
      opacity: 0.8;
    }
    .glow {
      opacity: 0.5;
    }
  }
`;

const HolographicOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(135deg, rgba(80,100,200,0.05) 0%, transparent 50%, rgba(80,100,200,0.05) 100%),
    repeating-linear-gradient(45deg, rgba(80,100,200,0.03) 0px, rgba(80,100,200,0.03) 1px, transparent 1px, transparent 4px);
  z-index: -1;
`;

const DiagonalShine = styled.div`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 300%;
  background: linear-gradient(45deg, transparent 45%, rgba(100,150,255,0.2) 50%, transparent 55%);
  z-index: -1;
  animation: ${shineSweep} 6s infinite linear;
  opacity: 0;
  transition: opacity 0.5s ease;
`;

const CyberGlow = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: radial-gradient(circle at center, rgba(80,100,200,0.15) 0%, transparent 70%);
  box-shadow: 0 0 30px rgba(80,100,200,0.3);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: -2;
`;

// Main component
const GlowCard = ({ width, height, children  }) => (
  <Container>
   
    <BatteryCard width={width} height={height}>
      <HolographicOverlay />
      <DiagonalShine className="diagonal" />
      <CyberGlow className="glow" />
        {children}
    </BatteryCard>
  </Container>
);

export default GlowCard;
