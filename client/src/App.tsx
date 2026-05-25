import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "@/pages/Home";
import Cockpit from "@/pages/Cockpit";
import Welcome from "@/pages/Welcome";
import LandingPage from "@/pages/LandingPage";
import Sobre from "@/pages/Sobre";
import Manifesto from "@/pages/Manifesto";
import Privacidade from "@/pages/Privacidade";
import Carreiras from "@/pages/Carreiras";
import Imprensa from "@/pages/Imprensa";
import RequireAuth from "@/components/RequireAuth";
import { LangProvider } from "@/landing/useLang";

function Router() {
  return (
    <Switch>
      {/* Landing institucional pública (rota raiz) — nova versão bilíngue PT/EN */}
      <Route path={"/"} component={LandingPage} />

      {/* Versão anterior preservada em /welcome para comparação */}
      <Route path={"/welcome"} component={Welcome} />

      {/* Cockpit interno NowGo — exige autenticação */}
      <Route path={"/cockpit"}>
        <RequireAuth>
          <Cockpit />
        </RequireAuth>
      </Route>

      {/* Jarvis cívico (legado, preservado em /civic) */}
      <Route path={"/civic"} component={Home} />

      {/* Páginas institucionais públicas (PT/EN/ES) */}
      <Route path={"/sobre"} component={Sobre} />
      <Route path={"/about"} component={Sobre} />
      <Route path={"/manifesto"} component={Manifesto} />
      <Route path={"/privacidade"} component={Privacidade} />
      <Route path={"/privacy"} component={Privacidade} />
      <Route path={"/carreiras"} component={Carreiras} />
      <Route path={"/careers"} component={Carreiras} />
      <Route path={"/carreras"} component={Carreiras} />
      <Route path={"/imprensa"} component={Imprensa} />
      <Route path={"/press"} component={Imprensa} />
      <Route path={"/prensa"} component={Imprensa} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LangProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LangProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
