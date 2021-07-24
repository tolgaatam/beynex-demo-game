import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App';

// Generate required css for using Feather icon library.
import iconFont from 'react-native-vector-icons/Fonts/Feather.ttf';
const iconFontStyles = `@font-face {
  src: url(${iconFont});
  font-family: Feather;
}`;

// Create stylesheet that has the font-face for Feather.
const style = document.createElement('style');
style.type = 'text/css';
if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
} else {
    style.appendChild(document.createTextNode(iconFontStyles));
}

// Inject the stylesheet finally
document.head.appendChild(style);

// Render the application into html.
ReactDOM.render(
    <div style={{height: '100%'}}><App/></div>,
  document.getElementById('react-root')
);
