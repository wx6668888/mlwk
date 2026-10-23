import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getCopy, type Locale } from "../content";
import { getStoreCopy } from "../store/storeCopy";
import { walkthroughLabels, walkthroughUrl } from "../walkthrough";
import { installLabels } from "../pwa";

export default function Footer({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const store = getStoreCopy(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-lead">
        <p>CIRMANO · Made As One</p>
      </div>
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/cirmano-wordmark-bone.svg" alt="CIRMANO" />
          <span>Made As One</span>
          <span>Integrated Whole-Home Customization</span>
        </div>
        <div>
          <Link to={`/${locale}/collections`}>{copy.nav.collections}</Link>
          <a href={walkthroughUrl(locale)}>{walkthroughLabels[locale]}</a>
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
          <button type="button" className="pwa-footer-install" data-pwa-install>
            {installLabels[locale]}
          </button>
          <span>Foshan, Guangdong, China</span>
          <a href="mailto:kai@cirmano.com">kai@cirmano.com</a>
          <a href="https://wa.me/8618666384092" target="_blank" rel="noreferrer">WhatsApp · +86 186 6638 4092</a>
          <span>Project enquiries</span>
          <span>English · العربية · 中文 · Deutsch · Français</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {year} CIRMANO</span>
        <span>Integrated Whole-Home Customization</span>
      </div>
    </footer>
  );
}
