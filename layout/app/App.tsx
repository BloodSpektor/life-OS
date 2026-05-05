import { RouterProvider } from "react-router";
import { FoodProvider } from "./store/foodContext";
import { router } from "./routes";

function App() {
  return (
    <FoodProvider>
      <RouterProvider router={router} />
    </FoodProvider>
  );
}

export default App;
