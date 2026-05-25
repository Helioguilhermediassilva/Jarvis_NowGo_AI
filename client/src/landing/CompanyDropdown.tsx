import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

type DropdownLink = { label: string; href: string };

type Props = {
  title: string;
  links: ReadonlyArray<DropdownLink>;
  /**
   * Prefixo aplicado a hrefs que começam com '#' (âncoras locais).
   * - Em LandingPage.tsx (rota '/'): passe `""` para manter `#section`.
   * - Em LandingShell.tsx (outras rotas): passe `"/"` para virar `/#section`.
   */
  anchorPrefix?: string;
};

/**
 * Dropdown acessível para o menu "Empresa" no header da landing.
 *
 * UX:
 *  - Hover abre/fecha automaticamente (com bridge para não perder cursor entre trigger e menu).
 *  - Click no botão também alterna (toggle) — útil para mobile e quando o usuário prefere clicar.
 *  - Click fora do dropdown fecha.
 *  - Tecla Escape fecha e devolve foco ao trigger.
 *  - Click em qualquer item do submenu fecha automaticamente.
 *  - aria-expanded refletindo o estado real (acessibilidade).
 */
export default function CompanyDropdown({ title, links, anchorPrefix = "" }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Fecha ao clicar fora do dropdown.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!containerRef.current || !target) return;
      if (!containerRef.current.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  // Fecha com tecla Escape e devolve foco ao trigger.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleSelect = () => setOpen(false);

  return (
    <div
      ref={containerRef}
      className={`ng-nav-dropdown${open ? " is-open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        className="ng-nav-dropdown-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <span className="ng-nav-dropdown-caret" aria-hidden="true">⌄</span>
      </button>
      <div className="ng-nav-dropdown-menu" role="menu">
        {links.map((link) => {
          const isInternalRoute = link.href.startsWith("/") && !link.href.startsWith("/#");
          if (isInternalRoute) {
            return (
              <Link
                key={link.label}
                href={link.href}
                role="menuitem"
                onClick={handleSelect}
              >
                {link.label}
              </Link>
            );
          }
          const normalizedHref = link.href.startsWith("#")
            ? `${anchorPrefix}${link.href}`
            : link.href;
          return (
            <a
              key={link.label}
              href={normalizedHref}
              role="menuitem"
              onClick={handleSelect}
            >
              {link.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
