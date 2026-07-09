/**
 * BlogCtaCard — card advertorial reutilizado nos artigos do blog.
 * Deep link contextual para WhatsApp (mensagem pré-preenchida por vertical)
 * + agendamento via cal.com.
 */

export const CAL_URL = "https://cal.com/helio-guilherme-jnrivp";

export const waLink = (msg: string) =>
  `https://wa.me/5561999708833?text=${encodeURIComponent(msg)}`;

type Props = {
  title: string;
  text: string;
  wa: string;
  waLabel: string;
};

export default function BlogCtaCard({ title, text, wa, waLabel }: Props) {
  return (
    <div className="ng-blog-cta">
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="ng-blog-cta-actions">
        <a href={wa} target="_blank" rel="noreferrer" className="btn-primary">
          {waLabel}
        </a>
        <a href={CAL_URL} target="_blank" rel="noreferrer" className="btn-secondary">
          Agendar diagnóstico
        </a>
      </div>
    </div>
  );
}
