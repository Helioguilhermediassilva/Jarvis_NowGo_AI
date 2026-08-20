import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

import { useAuthV2 } from "@/contexts/AuthV2Context";
import "@/landing/styles/design-system.css";
import { useLang } from "@/landing/useLang";
import { copy } from "@/landing/copy";
import {
  createBillingPortalSession,
  fetchBillingSummary,
  type ApiError,
  type BillingSummary,
} from "@/lib/authV2Client";

const PAGE_COPY = {
  pt: {
    eyebrow: "GESTÃO DA PLATAFORMA",
    title: "Plataforma de Inteligência Soberana",
    subtitle: "Gerencie sua assinatura, créditos e acesso ao Checkout seguro.",
    plan: "Plano atual",
    credits: "Saldo de créditos",
    status: "Status",
    renews: "Próxima renovação",
    portal: "Gerenciar assinatura",
    back: "Voltar ao site",
    noPlan: "Nenhuma assinatura ativa",
    noAccess: "Seu perfil ainda não tem acesso à Plataforma de Inteligência Soberana.",
    success: "Checkout concluído. A assinatura ou os créditos serão sincronizados após a confirmação do pagamento.",
    cancelled: "Checkout cancelado. Nenhuma cobrança foi concluída nesta sessão.",
    loading: "Carregando dados de billing…",
    unavailable: "Não foi possível carregar os dados de billing agora.",
  },
  en: {
    eyebrow: "PLATFORM MANAGEMENT",
    title: "Sovereign Intelligence Platform",
    subtitle: "Manage your subscription, credits and secure Checkout access.",
    plan: "Current plan",
    credits: "Credit balance",
    status: "Status",
    renews: "Next renewal",
    portal: "Manage subscription",
    back: "Back to website",
    noPlan: "No active subscription",
    noAccess: "Your profile does not have access to the Sovereign Intelligence Platform yet.",
    success: "Checkout completed. The subscription or credits will sync after payment confirmation.",
    cancelled: "Checkout cancelled. No charge was completed in this session.",
    loading: "Loading billing data…",
    unavailable: "Billing data could not be loaded right now.",
  },
  es: {
    eyebrow: "GESTIÓN DE LA PLATAFORMA",
    title: "Plataforma de Inteligencia Soberana",
    subtitle: "Administre su suscripción, créditos y acceso al Checkout seguro.",
    plan: "Plan actual",
    credits: "Saldo de créditos",
    status: "Estado",
    renews: "Próxima renovación",
    portal: "Gestionar suscripción",
    back: "Volver al sitio",
    noPlan: "No hay una suscripción activa",
    noAccess: "Su perfil aún no tiene acceso a la Plataforma de Inteligencia Soberana.",
    success: "Checkout concluido. La suscripción o los créditos se sincronizarán tras confirmar el pago.",
    cancelled: "Checkout cancelado. No se completó ningún cobro en esta sesión.",
    loading: "Cargando datos de billing…",
    unavailable: "No se pudieron cargar los datos de billing ahora.",
  },
} as const;

export default function BillingPage() {
  const { lang } = useLang();
  const text = PAGE_COPY[lang];
  const { user } = useAuthV2();
  const [, navigate] = useLocation();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);

  const content = copy[lang].pricing.selfService;
  const planName = useMemo(() => {
    const code = summary?.subscription?.planCode;
    return content.plans.find((plan) => plan.code.replace("_monthly", "") === code)?.name ?? text.noPlan;
  }, [content.plans, summary?.subscription?.planCode, text.noPlan]);

  useEffect(() => {
    let active = true;
    void fetchBillingSummary()
      .then((result) => {
        if (active) setSummary(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function openPortal() {
    setPortalBusy(true);
    setError(false);
    try {
      const result = await createBillingPortalSession();
      window.location.assign(result.url);
    } catch (rawError) {
      const errorValue = rawError as ApiError;
      if (errorValue.status === 401) navigate(`/login?returnTo=${encodeURIComponent("/billing")}`);
      else setError(true);
    } finally {
      setPortalBusy(false);
    }
  }

  const query = new URLSearchParams(window.location.search);
  const checkoutState = query.get("checkout");

  if (!user?.platformAccess) {
    return (
      <main className="ng-billing-page">
        <div className="ng-billing-card">
          <span className="tagline">{text.eyebrow}</span>
          <h1>{text.title}</h1>
          <p>{text.noAccess}</p>
          <Link href="/" className="btn-secondary">{text.back}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="ng-billing-page">
      <div className="ng-billing-shell">
        <header className="ng-billing-header">
          <div>
            <span className="tagline">{text.eyebrow}</span>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>
          <Link href="/" className="btn-secondary">{text.back}</Link>
        </header>

        {checkoutState === "success" && <div className="ng-billing-status ng-billing-status-success">{text.success}</div>}
        {checkoutState === "cancelled" && <div className="ng-billing-status">{text.cancelled}</div>}
        {error && <div className="ng-billing-status">{text.unavailable}</div>}

        {loading ? (
          <div className="ng-billing-card"><p>{text.loading}</p></div>
        ) : (
          <section className="ng-billing-grid">
            <article className="ng-billing-card">
              <span>{text.plan}</span>
              <strong>{planName}</strong>
              <small>{summary?.subscription?.status ?? text.noPlan}</small>
            </article>
            <article className="ng-billing-card">
              <span>{text.credits}</span>
              <strong>{(summary?.creditBalance ?? 0).toLocaleString(lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR")}</strong>
              <small>{content.creditsTitle}</small>
            </article>
            <article className="ng-billing-card">
              <span>{text.status}</span>
              <strong>{summary?.subscription?.status ?? text.noPlan}</strong>
              <small>{summary?.subscription?.cancelAtPeriodEnd ? "cancel_at_period_end" : "active"}</small>
            </article>
          </section>
        )}

        <div className="ng-billing-actions">
          <button type="button" className="btn-primary" disabled={portalBusy || !summary?.subscription} onClick={() => void openPortal()}>
            {portalBusy ? "…" : text.portal}
          </button>
        </div>
      </div>
    </main>
  );
}
