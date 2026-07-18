import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthV2Provider } from "./contexts/AuthV2Context";
import Home from "@/pages/Home";
import Cockpit from "@/pages/Cockpit";
import Welcome from "@/pages/Welcome";
import LandingPage from "@/pages/LandingPage";
import Sobre from "@/pages/Sobre";
import Manifesto from "@/pages/Manifesto";
import Privacidade from "@/pages/Privacidade";
import Carreiras from "@/pages/Carreiras";
import Imprensa from "@/pages/Imprensa";
import Blog from "@/pages/Blog";
import BlogInteligenciaArtificial from "@/pages/BlogInteligenciaArtificial";
import BlogIaNaSaude from "@/pages/BlogIaNaSaude";
import BlogAgentesDeIa from "@/pages/BlogAgentesDeIa";
import BlogIaParaAdvogados from "@/pages/BlogIaParaAdvogados";
import BlogIaEMachineLearning from "@/pages/BlogIaEMachineLearning";
import BlogIaNoBrasil from "@/pages/BlogIaNoBrasil";
import BlogIaGastaAgua from "@/pages/BlogIaGastaAgua";
import RequireAuth from "@/components/RequireAuth";
import { LangProvider } from "@/landing/useLang";

// F47 Fase 5.3 — Telas de autenticação V2.
import LoginPage from "@/pages/Login";
import AceitarConvitePage from "@/pages/AceitarConvite";
import VerificarEmailPage from "@/pages/VerificarEmail";
import EsqueciSenhaPage from "@/pages/EsqueciSenha";
import RedefinirSenhaPage from "@/pages/RedefinirSenha";
import MfaDesafioPage from "@/pages/MfaDesafio";
import MfaConfigurarPage from "@/pages/MfaConfigurar";
import AdminUsuariosPage from "@/pages/AdminUsuarios";
import RequireAuthV2 from "@/components/auth/RequireAuthV2";

function Router() {
  return (
    <Switch>
      {/* Landing institucional pública (rota raiz) — nova versão bilíngue PT/EN */}
      <Route path={"/"} component={LandingPage} />

      {/* Versão anterior preservada em /welcome para comparação */}
      <Route path={"/welcome"} component={Welcome} />

      {/* Cockpit interno NowGo — exige autenticação V1 (Google OAuth) */}
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
      {/* Blog — cluster de conteúdo SEO/AEO */}
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/inteligencia-artificial"} component={BlogInteligenciaArtificial} />
      <Route path={"/en/blog/inteligencia-artificial"} component={BlogInteligenciaArtificial} />
      <Route path={"/es/blog/inteligencia-artificial"} component={BlogInteligenciaArtificial} />
      <Route path={"/blog/inteligencia-artificial-na-saude"} component={BlogIaNaSaude} />
      <Route path={"/en/blog/inteligencia-artificial-na-saude"} component={BlogIaNaSaude} />
      <Route path={"/es/blog/inteligencia-artificial-na-saude"} component={BlogIaNaSaude} />
      <Route path={"/blog/agentes-de-inteligencia-artificial"} component={BlogAgentesDeIa} />
      <Route path={"/en/blog/agentes-de-inteligencia-artificial"} component={BlogAgentesDeIa} />
      <Route path={"/es/blog/agentes-de-inteligencia-artificial"} component={BlogAgentesDeIa} />
      <Route path={"/en/blog/agentes-de-inteligencia-artificial"} component={BlogAgentesDeIa} />
      <Route path={"/es/blog/agentes-de-inteligencia-artificial"} component={BlogAgentesDeIa} />
      <Route path={"/blog/inteligencia-artificial-para-advogados"} component={BlogIaParaAdvogados} />
      <Route path={"/blog/inteligencia-artificial-e-machine-learning"} component={BlogIaEMachineLearning} />
      <Route path={"/en/blog/inteligencia-artificial-e-machine-learning"} component={BlogIaEMachineLearning} />
      <Route path={"/es/blog/inteligencia-artificial-e-machine-learning"} component={BlogIaEMachineLearning} />
      <Route path={"/blog/inteligencia-artificial-no-brasil"} component={BlogIaNoBrasil} />
      <Route path={"/en/blog/inteligencia-artificial-no-brasil"} component={BlogIaNoBrasil} />
      <Route path={"/es/blog/inteligencia-artificial-no-brasil"} component={BlogIaNoBrasil} />
      <Route path={"/en/blog/inteligencia-artificial-no-brasil"} component={BlogIaNoBrasil} />
      <Route path={"/es/blog/inteligencia-artificial-no-brasil"} component={BlogIaNoBrasil} />
      <Route path={"/blog/inteligencia-artificial-gasta-agua"} component={BlogIaGastaAgua} />

      <Route path={"/imprensa"} component={Imprensa} />
      <Route path={"/press"} component={Imprensa} />
      <Route path={"/prensa"} component={Imprensa} />

      {/* F47 Fase 5.3 — Autenticação V2 (públicas) */}
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/cadastro"} component={AceitarConvitePage} />
      <Route path={"/aceitar-convite/:token"} component={AceitarConvitePage} />
      <Route path={"/verificar-email/:token"} component={VerificarEmailPage} />
      <Route path={"/esqueci-senha"} component={EsqueciSenhaPage} />
      <Route path={"/redefinir-senha/:token"} component={RedefinirSenhaPage} />
      <Route path={"/mfa/desafio"} component={MfaDesafioPage} />
      <Route path={"/mfa/configurar"} component={MfaConfigurarPage} />

      {/* F47 Fase 5.3 — Admin (exige sessão V2 + papel administrativo) */}
      <Route path={"/admin/usuarios"}>
        <RequireAuthV2 requireRole={["superadmin", "owner", "admin"]}>
          <AdminUsuariosPage />
        </RequireAuthV2>
      </Route>

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthV2Provider>
          <LangProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </LangProvider>
        </AuthV2Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
