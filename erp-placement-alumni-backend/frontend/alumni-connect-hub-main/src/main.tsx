import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "college-erp-theme/css";
import "college-erp-theme/colleges/pvg/config.css";
import "college-erp-theme/js";
import "./styles.css";

const router = getRouter(); 

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);