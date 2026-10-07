import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

/**
 * Shop-wide display settings (currency, low-stock threshold) for any page.
 *
 * Fetched once and shared through a module-level cache, so moving between pages
 * doesn't refetch. The settings page pushes saved values in with
 * `updateShopSettingsCache`, so a currency change shows up everywhere without
 * a reload.
 */

export const DEFAULT_SHOP_SETTINGS = {
  currency: "so'm",
  lowStockThreshold: 10,
};

let cache = null;
let pending = null;
const listeners = new Set();

function normalise(data) {
  return {
    currency: data?.currency || DEFAULT_SHOP_SETTINGS.currency,
    lowStockThreshold: Number.isFinite(data?.lowStockThreshold)
      ? data.lowStockThreshold
      : DEFAULT_SHOP_SETTINGS.lowStockThreshold,
  };
}

export function updateShopSettingsCache(data) {
  cache = normalise(data);
  listeners.forEach((listener) => listener(cache));
}

export default function useShopSettings() {
  const { status } = useSession();
  const [settings, setSettings] = useState(cache || DEFAULT_SHOP_SETTINGS);

  useEffect(() => {
    listeners.add(setSettings);
    if (cache) setSettings(cache);

    if (status === 'authenticated' && !cache && !pending) {
      pending = axios
        .get('/api/settings')
        .then((response) => updateShopSettingsCache(response.data.data))
        // Defaults stay in place; a later mount will try again.
        .catch((error) => console.error('Sozlamalarni yuklab bo\'lmadi:', error))
        .finally(() => {
          pending = null;
        });
    }

    return () => listeners.delete(setSettings);
  }, [status]);

  return settings;
}

/** `1 200 000 so'm` — the money format used across the panel. */
export function formatMoney(amount, currency) {
  return `${(Number(amount) || 0).toLocaleString()} ${currency}`;
}
