import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "@/pages/Home";
import Cockpit from "@/pages/Cockpit";
import Welcome from "@/pages/Welcome";
import RequireAuth from "@/components/RequireAuth";

function Router() {
  return (
    <Switch>
      {/* Landing institucional pública (rota raiz) */}
      <Route path={"/"} component={Welcome} />

      {/* Cockpit interno NowGo — exige autenticação */}
      <Route path={"/cockpit"}>
        <RequireAuth>
          <Cockpit />
        </RequireAuth>
      </Route>

      {/* Jarvis cívico (legado, preservado em /civic) */}
      <Route path={"/civic"} component={Home} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
