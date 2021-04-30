import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Client as Styletron } from 'styletron-engine-atomic';
import { LightTheme, DarkTheme, BaseProvider, styled } from 'baseui';
import { Provider as StyletronProvider } from 'styletron-react';

const engine = new Styletron();

ReactDOM.render(
    <React.StrictMode>
        <StyletronProvider value={engine}>
            <BaseProvider theme={LightTheme}>
                <App />
            </BaseProvider>
        </StyletronProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
