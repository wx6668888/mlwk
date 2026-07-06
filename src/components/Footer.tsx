import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getCopy, type Locale } from "../content";
import { getStoreCopy } from "../store/storeCopy";

export default function Footer({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const store = getStoreCopy(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-lead">
        <p>MLWK</p>
      </div>
      <div className="footer-grid">
        <div>
          <strong>MLWK</strong>
          <span>Millwork, Made to Order.</span>
        </div>
        <div>
          <Link to={`/${locale}/collections`}>{copy.nav.collections}</Link>
          <Link to={`/${locale}/shop`}>{store.shop}</Link>
          <Link to={`/${locale}/solutions`}>{copy.nav.solutions}</Link>
          <Link to={`/${locale}/capabilities`}>{copy.nav.capabilities}</Link>
        </div>
        <div>
          <Link to={`/${locale}/resources`}>Resources</Link>
          <Link to={`/${locale}/privacy`}>Privacy</Link>
          <Link to={`/${locale}/terms`}>Terms</Link>
          <Link to={`/${locale}/shipping`}>Shipping</Link>
          <Link to={`/${locale}/returns`}>Returns</Link>
        </div>
        <div className="footer-note">
          <span>Global project enquiries</span>
          <span>English · العربية · 中文 · Deutsch · Français</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {year} MLWK</span>
        <span>Architectural millwork & custom cabinetry</span>
      </div>
    </footer>
  );
}
