import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ErrorBoundary from "./ErrorBoundary";

window.addEventListener("error", (event) => {
    if (event.message === "Script error.") {
        event.preventDefault();
    }
});

window.addEventListener("unhandledrejection", (event) => {
    event.preventDefault();
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </BrowserRouter>
);
