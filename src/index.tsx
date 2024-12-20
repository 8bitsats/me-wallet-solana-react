import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import TestApp from "./TestApp";
import reportWebVitals from "./reportWebVitals";
import { Buffer } from "buffer";
window.Buffer = Buffer; // Make Buffer available globally if needed

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
