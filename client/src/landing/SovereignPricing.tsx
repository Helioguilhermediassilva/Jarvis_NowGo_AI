import { useEffect, useState } from "react";

import {
  createBillingCheckoutSession,
  type ApiError,
} from "@/lib/authV2Client";
import { copy } from "./copy";

type SelfServiceCopy = (typeof copy)[keyof typeof copy]["pricing"]["selfService"];

type Props = {
  content: SelfServiceCopy;
};

const PENDING_OFFER_KEY = "nowgo.pendingBillingOffer";
const PENDING_RETURN_KEY = "nowgo.pendingBillingReturnTo";

function currentPricingReturnTo(): string {
  const path = window.location.pathname || "/";
  const search = window.location.search || "";
  const hash = window.location.hash || "#pricing";
  return `${path}${search}${hash}`;
}

function rememberPendingCheckout(code: string): void {
  window.sessionStorage.setItem(PENDING_OFFER_KEY, code);
  window.sessionStorage.setItem(PENDING_RETURN_KEY, currentPricingReturnTo());
}

export default function SovereignPricing({ content }: Props) {
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(code: string) {
    if (busyCode) return;
    setBusyCode(code);
    setError(null);

    try {
      const result = await createBillingCheckoutSession(code);
      window.sessionStorage.removeItem(PENDING_OFFER_KEY);
      window.sessionStorage.removeItem(PENDING_RETURN_KEY);
      window.location.assign(result.url);
    } catch (rawError) {
      const err = rawError as ApiError;
      if (err.status === 401) {
        // Preserve both plans and credit packs when authentication is required.
        // If the session cookie is not immediately available after login/MFA,
        // this branch re-saves the offer instead of losing the user's intent.
        rememberPendingCheckout(code);
        const returnTo = currentPricingReturnTo();
        const loginParams = new URLSearchParams({
          returnTo,
          billingOffer: code,
        });
        window.location.assign(`/login?${loginParams.toString()}`);
        return;
      }
      if (err.status === 403) {
        setError(content.accessDenied);
      } else {
        setError(content.unavailable);
      }
    } finally {
      setBusyCode(null);
    }
  }

  useEffect(() => {
    const pending = window.sessionStorage.getItem(PENDING_OFFER_KEY);
    if (!pending) return;

    // Consume before starting to avoid duplicate Checkout Sessions under React
    // StrictMode; a 401 inside startCheckout() persists it again for retry.
    window.sessionStorage.removeItem(PENDING_OFFER_KEY);
    void startCheckout(pending);
    // Executa apenas o checkout pendente após o retorno do login.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ng-self-service">
      <div className="ng-self-service-head reveal">
        <span className="tagline">{content.eyebrow}</span>
        <h3 className="ng-self-service-title">{content.title}</h3>
        <p className="ng-section-sub">{content.subtitle}</p>
      </div>

      {error && <div className="ng-billing-notice" role="alert">{error}</div>}

      <div className="ng-self-service-plans">
        {content.plans.map((plan, index) => (
          <article
            key={plan.code}
            className={`ng-tier ng-self-service-plan reveal${plan.highlight ? " highlight" : ""}`}
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            {plan.highlight && <span className="ng-tier-flag">★</span>}
            <h4 className="ng-tier-name">{plan.name}</h4>
            <div className="ng-tier-price"><strong>{plan.price}</strong><span>{plan.period}</span></div>
            <p className="ng-self-service-credits">{plan.credits}</p>
            <p className="ng-tier-desc">{plan.desc}</p>
            <ul className="ng-tier-features">
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <button
              type="button"
              className={plan.highlight ? "btn-primary" : "btn-secondary"}
              disabled={busyCode !== null}
              onClick={() => void startCheckout(plan.code)}
            >
              {busyCode === plan.code ? "…" : plan.cta}
            </button>
          </article>
        ))}
      </div>

      <div className="ng-credit-packs reveal">
        <div className="ng-credit-packs-head">
          <h3 className="ng-self-service-title">{content.creditsTitle}</h3>
          <p className="ng-section-sub">{content.creditsSubtitle}</p>
        </div>
        <div className="ng-credit-packs-grid">
          {content.packs.map((pack) => (
            <article key={pack.code} className="ng-credit-pack">
              <div>
                <h4>{pack.name}</h4>
                <strong>{pack.price}</strong>
                <span>{pack.unit}</span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                disabled={busyCode !== null}
                onClick={() => void startCheckout(pack.code)}
              >
                {busyCode === pack.code ? "…" : pack.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
