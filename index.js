import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App';

// Use prebuilt version of RNVI in dist folder
import Icon from 'react-native-vector-icons/dist/FontAwesome';

// Generate required css
import iconFont from 'react-native-vector-icons/Fonts/Feather.ttf';
const iconFontStyles = `@font-face {
  src: url(${iconFont});
  font-family: Feather;
}`;

// Create stylesheet
const style = document.createElement('style');
style.type = 'text/css';
if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
} else {
    style.appendChild(document.createTextNode(iconFontStyles));
}

// Inject stylesheet
document.head.appendChild(style);

ReactDOM.render(
    <div style={{height: '100%'}}><App/></div>,
  document.getElementById('react-root')
);
