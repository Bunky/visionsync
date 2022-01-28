/* stylelint-disable selector-id-pattern */
import { createGlobalStyle } from 'styled-components';

export default typeof createGlobalStyle === 'function' && createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body,
  html {
    margin: 0;
    padding: 0;
    height: 100vh;
  }

  body > div:first-child,
  div#__next,
  div#__next > div {
    height: 100%;
  }
`;
