import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Concierge from "./components/Concierge";
import { AuthProvider } from "./auth/AuthContext";
import {
  getCopy,
  isLocale,
  localeMeta,
  type Locale,
} from "./content";
import CapabilitiesPage from "./pages/CapabilitiesPage";
import {
  CollectionsPage,
  CollectionDetailPage,
} from "./pages/CollectionsPage";
import CompanyPage from "./pages/CompanyPage";
import AdminProjectsPage from "./pages/AdminProjectsPage";
import DesignerPage from "./pages/DesignerPage";
import HomePage from "./pages/HomePage";
import LegalPage from "./pages/LegalPage";
import ProjectsPage from "./pages/ProjectsPage";
import QuotePage from "./pages/QuotePage";
import ResourcesPage from "./pages/ResourcesPage";
import {
  SolutionsPage,
  SolutionDetailPage,
} from "./pages/SolutionsPage";
import {
  CartPage,
  CheckoutPage,
  OrderConfirmationPage,
  ProductPage,
  ShopPage,
} from "./pages/StorePages";
import {
  AccountAddressesPage,
  AccountFavoritesPage,
  AccountGuard,
  AccountOrdersPage,
  AccountProjectsPage,
  AuthCallbackPage,
  LoginPage,
} from "./pages/AuthPages";
import { StoreProvider } from "./store/StoreContext";
import { getStoreCopy } from "./store/storeCopy";

function LocaleLayout() {
  const params = useParams();
  const location = useLocation();
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const copy = getCopy(locale);
  const store = getStoreCopy(locale);
  const routeName = location.pathname.split("/")[2] || "home";
  const isHome = routeName === "home";
  const isDesigner = routeName === "designer";
  const isAuth = routeName === "login" || routeName === "auth";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeMeta[locale].dir;
    const page = routeName in copy.pages
      ? copy.pages[routeName as keyof typeof copy.pages]
      : undefined;
    document.title = page
      ? `${page[1]} — MLWK`
      : routeName === "designer"
        ? "3D Design Studio — MLWK"
      : routeName === "shop"
        ? `${store.shopTitle} — MLWK`
        : `${copy.home.title} — MLWK`;
  }, [copy, locale, location.pathname, routeName, store.shopTitle]);

  if (!isLocale(params.locale)) return <Navigate replace to="/en/" />;

  return (
    <div className="site">
      {!isDesigner && !isAuth && <Header locale={locale} />}
      <main>
        <Routes>
          <Route index element={<HomePage locale={locale} />} />
          <Route path="collections" element={<CollectionsPage locale={locale} />} />
          <Route
            path="collections/:slug"
            element={<CollectionRoute locale={locale} />}
          />
          <Route path="solutions" element={<SolutionsPage locale={locale} />} />
          <Route
            path="solutions/:slug"
            element={<SolutionRoute locale={locale} />}
          />
          <Route path="projects" element={<ProjectsPage locale={locale} />} />
          <Route
            path="capabilities"
            element={<CapabilitiesPage locale={locale} />}
          />
          <Route path="company" element={<CompanyPage locale={locale} />} />
          <Route path="designer" element={<DesignerPage locale={locale} />} />
          <Route path="resources" element={<ResourcesPage locale={locale} />} />
          <Route path="quote" element={<QuotePage locale={locale} />} />
          <Route path="shop" element={<ShopPage locale={locale} />} />
          <Route path="shop/:slug" element={<ProductPage locale={locale} />} />
          <Route path="cart" element={<CartPage locale={locale} />} />
          <Route path="checkout" element={<CheckoutPage locale={locale} />} />
          <Route
            path="order/:id/confirmation"
            element={<OrderConfirmationPage locale={locale} />}
          />
          <Route path="login" element={<LoginPage locale={locale} />} />
          <Route
            path="auth/callback"
            element={<AuthCallbackPage locale={locale} />}
          />
          <Route
            path="account"
            element={<Navigate replace to={`/${locale}/account/projects`} />}
          />
          <Route
            path="account/projects"
            element={
              <AccountGuard locale={locale}>
                <AccountProjectsPage locale={locale} />
              </AccountGuard>
            }
          />
          <Route
            path="account/orders"
            element={
              <AccountGuard locale={locale}>
                <AccountOrdersPage locale={locale} />
              </AccountGuard>
            }
          />
          <Route
            path="account/addresses"
            element={
              <AccountGuard locale={locale}>
                <AccountAddressesPage locale={locale} />
              </AccountGuard>
            }
          />
          <Route
            path="account/favorites"
            element={
              <AccountGuard locale={locale}>
                <AccountFavoritesPage locale={locale} />
              </AccountGuard>
            }
          />
          <Route
            path="admin/projects"
            element={
              <AccountGuard locale={locale}>
                <AdminProjectsPage locale={locale} />
              </AccountGuard>
            }
          />
          <Route
            path="privacy"
            element={<LegalPage locale={locale} type="privacy" />}
          />
          <Route
            path="terms"
            element={<LegalPage locale={locale} type="terms" />}
          />
          <Route
            path="shipping"
            element={<LegalPage locale={locale} type="shipping" />}
          />
          <Route
            path="returns"
            element={<LegalPage locale={locale} type="returns" />}
          />
          <Route path="*" element={<Navigate replace to={`/${locale}/`} />} />
        </Routes>
      </main>
      {!isHome && !isDesigner && !isAuth && <Concierge locale={locale} />}
      {!isDesigner && !isAuth && <Footer locale={locale} />}
    </div>
  );
}

function CollectionRoute({ locale }: { locale: Locale }) {
  const { slug = "" } = useParams();
  return <CollectionDetailPage locale={locale} slug={slug} />;
}

function SolutionRoute({ locale }: { locale: Locale }) {
  const { slug = "" } = useParams();
  return <SolutionDetailPage locale={locale} slug={slug} />;
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <AuthProvider>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Navigate replace to="/en/" />} />
          <Route path="/:locale/*" element={<LocaleLayout />} />
          <Route path="*" element={<Navigate replace to="/en/" />} />
        </Routes>
      </StoreProvider>
    </AuthProvider>
  );
}
