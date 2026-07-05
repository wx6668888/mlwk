import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Concierge from "./components/Concierge";
import { AuthProvider } from "./auth/AuthContext";
import {
  collections,
  getCopy,
  isLocale,
  localeMeta,
  solutions,
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
import { findProduct } from "../shared/storeCatalog";

const utilityTitles: Record<
  Locale,
  { designer: string; shipping: string; returns: string; confirmation: string; admin: string }
> = {
  en: {
    designer: "3D Design Studio",
    shipping: "Shipping and duties",
    returns: "Returns and refunds",
    confirmation: "Order confirmation",
    admin: "Project updates",
  },
  zh: {
    designer: "3D 空间设计",
    shipping: "运输与税费",
    returns: "退换与退款",
    confirmation: "订单确认",
    admin: "项目更新",
  },
  ar: {
    designer: "استوديو التصميم ثلاثي الأبعاد",
    shipping: "الشحن والرسوم",
    returns: "الإرجاع والاسترداد",
    confirmation: "تأكيد الطلب",
    admin: "تحديثات المشروع",
  },
  de: {
    designer: "3D Design Studio",
    shipping: "Versand und Abgaben",
    returns: "Rückgabe und Erstattung",
    confirmation: "Bestellbestätigung",
    admin: "Projektaktualisierungen",
  },
  fr: {
    designer: "Studio de conception 3D",
    shipping: "Livraison et droits",
    returns: "Retours et remboursements",
    confirmation: "Confirmation de commande",
    admin: "Mises à jour du projet",
  },
};

function LocaleLayout() {
  const params = useParams();
  const location = useLocation();
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const copy = getCopy(locale);
  const store = getStoreCopy(locale);
  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeName = pathParts[1] || "home";
  const routeDetail = pathParts[2] || "";
  const isHome = routeName === "home";
  const isDesigner = routeName === "designer";
  const isAuth = routeName === "login" || routeName === "auth";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeMeta[locale].dir;
    const page = routeName in copy.pages
      ? copy.pages[routeName as keyof typeof copy.pages]
      : undefined;
    const collection = collections.find((item) => item.slug === routeDetail);
    const solution = solutions.find((item) => item.slug === routeDetail);
    const product = routeName === "shop" ? findProduct(routeDetail) : undefined;
    const title =
      collection?.name[locale] ??
      solution?.name[locale] ??
      product?.name[locale] ??
      (routeName === "quote"
        ? copy.quote.title
        : routeName === "designer"
          ? utilityTitles[locale].designer
          : routeName === "shop"
            ? store.shopTitle
            : routeName === "cart"
              ? store.cart
              : routeName === "checkout"
                ? store.checkoutTitle
                : routeName === "login"
                  ? store.signIn
                  : routeName === "account"
                    ? store.account
                    : routeName === "shipping"
                      ? utilityTitles[locale].shipping
                      : routeName === "returns"
                        ? utilityTitles[locale].returns
                        : routeName === "order"
                          ? utilityTitles[locale].confirmation
                          : routeName === "admin"
                            ? utilityTitles[locale].admin
                            : page?.[1] ?? copy.home.title);
    document.title = `${title} — MLWK`;
  }, [
    copy,
    locale,
    routeDetail,
    routeName,
    store.account,
    store.cart,
    store.checkoutTitle,
    store.shopTitle,
    store.signIn,
  ]);

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
