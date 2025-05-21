// SlideButton.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

/* ----------------------------------------------------------------------------
   1) BUTTON WRAPPER
   ----------------------------------------------------------------------------
   - width: fluid up to max-width (12rem). You can also force fullWidth.
   - font-size: 1rem (can be overridden by a parent if you need bigger/smaller).
   - position: relative for the overlays (border + highlight).
   - focusable with a clear focus-visible outline.
   ---------------------------------------------------------------------------- */
const BaseButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  outline: none;
  border: none;
  background: transparent;
  padding: 0;              /* no internal padding; the children handle spacing */
  font-size: 1rem;         /* base font-size, adjustable via parent */
  font-family: inherit;

  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  max-width: 12rem;
  height: auto;

  /* Make sure the button isn't taller than necessary, but allow vertical padding. */
  line-height: 1;

  /* Focus styles */
  &:focus-visible {
    outline: 2px solid #7aa1e0; /* or any color that meets contrast */
    outline-offset: 2px;
  }

  /* :active “pressed” state */
  &:active {
    transform: scale(0.98);
    transition: transform 0.1s ease-in-out;
  }
`;

/* ----------------------------------------------------------------------------
   2) BORDER OVERLAY (the white border around the button)
   ---------------------------------------------------------------------------- */
const BorderOverlay = styled.span`
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid #fefefe;
  box-sizing: border-box;
  z-index: 0;
  pointer-events: none; /* purely decorative */
`;

/* ----------------------------------------------------------------------------
   3) HIGHLIGHT OVERLAY (dark overlay that “un-covers” on hover)
   ----------------------------------------------------------------------------
   - Placed slightly inset (top:6px; left:-2px; etc., like you had before).
   - On hover of BaseButton, we scale Y to 0 (so it disappears).
   ---------------------------------------------------------------------------- */
const HighlightOverlay = styled.span`
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
  pointer-events: none;

  ${BaseButton}:hover & {
    transform: scaleY(0);
  }
`;

/* ----------------------------------------------------------------------------
   4) ICON CONTAINER (the black square that expands on hover)
   ----------------------------------------------------------------------------
   - Starts at width: 3rem (square).
   - On hover, expands to 100% width of the button.
   - We keep overflow:hidden so that the icon “slides” inside cleanly.
   ---------------------------------------------------------------------------- */
const IconContainer = styled.span`
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

  ${BaseButton}:hover & {
    width: 100%;
  }
`;

/* ----------------------------------------------------------------------------
   5) ICON WRAPPER (holds the actual icon; slides horizontally)
   ----------------------------------------------------------------------------
   - At rest: transform: translateX(0).
   - On hover: translateX(calc(100% - 3rem)) → moves all the way right minus its own width.
   ---------------------------------------------------------------------------- */
const IconWrapper = styled.span`
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s cubic-bezier(0.65, 0, 0.076, 1);

  ${BaseButton}:hover & {
    transform: translateX(calc(100% - (-4rem)));
  }
`;

/* ----------------------------------------------------------------------------
   6) TEXT (the actual button label)
   ----------------------------------------------------------------------------
   - Absolutely centered vertically/horizontally (with padding top/bottom).
   - Color transitions/letter-spacing on hover.
   ---------------------------------------------------------------------------- */
const ButtonText = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.75rem 0;
  margin-left: 3rem; /* leave space for the icon’s resting position */
  color: #ffffff;
  font-weight: 700;
  line-height: 1.6;
  text-align: center;
  text-transform: uppercase;
  z-index: 4;
  transition: color 0.45s cubic-bezier(0.65, 0, 0.076, 1),
              letter-spacing 0.45s cubic-bezier(0.65, 0, 0.076, 1);

  ${BaseButton}:hover & {
    color: #ffffff;      /* stays white, but you could lighten it more if you want */
    letter-spacing: 0.5px;
  }
`;

/**
 * SlideButton Props:
 * @param {string}     text      – Button label (required)
 * @param {ReactNode}  icon      – Any React component to render as the icon (optional)
 * @param {object}     style     – Inline style overrides (optional)
 * @param {function}   onClick   – Click handler (optional)
 * @param {boolean}    fullWidth – If true, button stretches to 100% of parent (optional, default=false)
 * @param {boolean}    disabled  – If true, button is disabled (optional, default=false)
 */
const SlideButton = ({ text, icon, style, onClick, fullWidth, disabled }) => {
  return (
    <BaseButton
      onClick={onClick}
      style={style || {}}
      type="button"          /* avoids accidental form submits */
      fullWidth={fullWidth}  /* custom prop we read in styled-component */
      aria-label={text}    /* good practice for screen readers */
      disabled={disabled}   /* disable button if needed */
    >
      {/* White border around the entire button */}
      <BorderOverlay aria-hidden="true" />

      {/* Dark overlay that “uncovers” on hover */}
      <HighlightOverlay aria-hidden="true" />

      {/* Black square that expands */}
      <IconContainer aria-hidden="true">
        {icon && <IconWrapper>{icon}</IconWrapper>}
      </IconContainer>

      {/* Button label */}
      <ButtonText>{text}</ButtonText>
    </BaseButton>
  );
};

SlideButton.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.node,
  style: PropTypes.object,
  onClick: PropTypes.func,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
};

SlideButton.defaultProps = {
  icon: null,
  style: null,
  onClick: null,
  fullWidth: false,
};

export default SlideButton;
