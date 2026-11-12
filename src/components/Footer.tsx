import { Link } from "react-router-dom";
import { localeMeta, locales, type Locale } from "../content";
import { brand } from "../site/brand";
import { navSections, productCategories } from "../site/navigation";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "./nav/SocialIcons";
import "./Footer.css";

const labels = {
  products: { en: "Products", zh: "产品", ar: "المنتجات", de: "Produkte", fr: "Produits" },
  company: { en: "CIRMANO", zh: "CIRMANO", ar: "CIRMANO", de: "CIRMANO", fr: "CIRMANO" },
  contact: { en: "Contact", zh: "联系", ar: "تواصل", de: "Kontakt", fr: "Contact" },
  follow: { en: "Follow CIRMANO", zh: "关注 CIRMANO", ar: "تابع CIRMANO", de: "CIRMANO folgen", fr: "Suivre CIRMANO" },
  privacy: { en: "Privacy", zh: "隐私", ar: "الخصوصية", de: "Datenschutz", fr: "Confidentialité" },
  terms: { en: "Terms", zh: "条款", ar: "الشروط", de: "Bedingungen", fr: "Conditions" },
  shipping: { en: "Shipping", zh: "运输", ar: "الشحن", de: "Versand", fr: "Livraison" },
  returns: { en: "Returns", zh: "退换", ar: "الإرجاع", de: "Rückgabe", fr: "Retours" },
} as const;

export default function Footer({ locale }: { locale: Locale }) {
  const href = (to: string) => `/${locale}/${to}`;
  const year = new Date().getFullYear();
  const companyLinks = navSections.filter((s) => s.id !== "products");

  return (
    <footer className="ft">
      <div className="ft__in">
        <div className="ft__top">
          <div className="ft__brand">
            <img src="/brand/CIRMANO_horizontal_CNEN_bone.svg" alt="CIRMANO 西尔曼" width="240" height="108" loading="lazy" />
            <p>
              {brand.slogan}
              <br />
              <span>{brand.descriptor}</span>
            </p>
          </div>

          <nav className="ft__cols" aria-label="Footer">
            <div>
              <h2>{labels.products[locale]}</h2>
              <ul>
                {productCategories.map((c) => (
                  <li key={c.slug}><Link to={href(`products/${c.slug}`)}>{c.name[locale]}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h2>{labels.company[locale]}</h2>
              <ul>
                {companyLinks.map((s) => (
                  <li key={s.id}><Link to={href(s.to)}>{s.label[locale]}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h2>{labels.contact[locale]}</h2>
              <ul>
                <li><a href={`mailto:${brand.email}`}>{brand.email}</a></li>
                <li><a href={brand.phoneHref} dir="ltr">{brand.phoneDisplay}</a></li>
                <li><a href={brand.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              </ul>
              <address>{brand.address.join(" ")}</address>
            </div>
          </nav>
        </div>

        <div className="ft__social">
          <span>{labels.follow[locale]}</span>
          <a href={brand.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /><span>Instagram</span></a>
          <a href={brand.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /><span>Facebook</span></a>
          <a href={brand.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon /><span>WhatsApp</span></a>
        </div>

        <div className="ft__bottom">
          <span>© {year} CIRMANO. {brand.city}.</span>
          <a className="ft__credit" href="https://github.com/Sam1983Aing/casa-serra" target="_blank" rel="noopener noreferrer">Preview walkthrough based on Casa Serra by Samnang Aing</a>
          <span className="ft__legal">
            <Link to={href("privacy")}>{labels.privacy[locale]}</Link>
            <Link to={href("terms")}>{labels.terms[locale]}</Link>
            <Link to={href("shipping")}>{labels.shipping[locale]}</Link>
            <Link to={href("returns")}>{labels.returns[locale]}</Link>
          </span>
          <span className="ft__langs">
            {locales.map((item) => (
              <Link key={item} to={`/${item}/`} lang={item} aria-current={item === locale ? "true" : undefined}>
                {localeMeta[item].label}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
