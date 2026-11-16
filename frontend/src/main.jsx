import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InternetIdentityProvider } from "./contexts/InternetIdentityContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { App } from "./App.jsx";
import "./styles/base.css";
import "./styles/sidebar.css";
import "./styles/login.css";
import "./styles/app.css";
import "./styles/login-animations.css";
BigInt.prototype.toJSON = function () {
  return this.toString();
};
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
