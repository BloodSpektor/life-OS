import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Fridge } from "./pages/Fridge";
import { Nutrition } from "./pages/Nutrition";
import { Expenses } from "./pages/Expenses";
import { Reminders } from "./pages/Reminders";
import { Statistics } from "./pages/Statistics";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "fridge", Component: Fridge },
      { path: "nutrition", Component: Nutrition },
      { path: "expenses", Component: Expenses },
      { path: "reminders", Component: Reminders },
      { path: "statistics", Component: Statistics },
    ],
  },
]);
