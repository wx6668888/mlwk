import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  currencyForCountry,
  findProduct,
  productPrice,
  type Currency,
} from "../../shared/storeCatalog";
import { track } from "../lib/analytics";

export type CartItem = {
  sku: string;
  quantity: number;
  finish: string;
};

type StoreContextValue = {
  hydrated: boolean;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (sku: string, finish: string, quantity: number) => void;
  removeItem: (sku: string, finish: string) => void;
  clearCart: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = "mlwk.store.cart.v1";
const CURRENCY_KEY = "mlwk.store.currency.v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem(CURRENCY_KEY) as Currency | null;
      if (savedCurrency && ["USD", "EUR", "GBP"].includes(savedCurrency)) {
        setCurrencyState(savedCurrency);
      } else {
        fetch("/api/store/context")
          .then(async (response) =>
            response.ok
              ? ((await response.json()) as {
                  currency?: Currency;
                  country?: string;
                })
              : null,
          )
          .then((result) => {
            if (result?.currency) setCurrencyState(result.currency);
            else setCurrencyState(currencyForCountry(result?.country));
          })
          .catch(() => undefined);
      }
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartItem[];
        setCart(
          parsed.filter(
            (item) =>
              findProduct(item.sku) &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0,
          ),
        );
      }
    } catch {
      // Private browsing or malformed storage should not block shopping.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // Keep the in-memory cart when storage is unavailable.
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_KEY, currency);
    } catch {
      // Currency still remains valid for this session.
    }
  }, [currency]);

  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    track("currency_changed", { currency: next });
  };

  const addItem = (item: CartItem) => {
    setCart((current) => {
      const existing = current.find(
        (entry) => entry.sku === item.sku && entry.finish === item.finish,
      );
      if (existing) {
        return current.map((entry) =>
          entry === existing
            ? { ...entry, quantity: Math.min(20, entry.quantity + item.quantity) }
            : entry,
        );
      }
      return [...current, { ...item, quantity: Math.min(20, item.quantity) }];
    });
    track("add_to_cart", { sku: item.sku, quantity: item.quantity });
  };

  const updateQuantity = (sku: string, finish: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((current) =>
        current.filter((item) => !(item.sku === sku && item.finish === finish)),
      );
      return;
    }
    setCart((current) =>
      current.map((item) =>
        item.sku === sku && item.finish === finish
          ? { ...item, quantity: Math.min(20, quantity) }
          : item,
      ),
    );
  };

  const removeItem = (sku: string, finish: string) => {
    setCart((current) =>
      current.filter((item) => !(item.sku === sku && item.finish === finish)),
    );
  };

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const found = findProduct(item.sku);
        return found ? sum + productPrice(found, currency) * item.quantity : sum;
      }, 0),
    [cart, currency],
  );

  const value = useMemo(
    () => ({
      hydrated,
      currency,
      setCurrency,
      cart,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart: () => setCart([]),
    }),
    [cart, currency, hydrated, subtotal],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
