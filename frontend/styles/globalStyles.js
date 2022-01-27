import { createGlobalStyle } from 'styled-components';

export default typeof createGlobalStyle === 'function' && createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body,
  html {
    margin: 0;
    padding: 0;
  }
`;
