import { css } from 'lit';

// language=CSS
export const accessibilityStyles = css`
  .visually-hidden {
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      height: 1px;
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
      width: 1px;
  }
`;