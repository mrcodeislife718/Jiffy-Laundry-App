export interface ServiceOffer {
  serviceType: string;
  amountCents: number;
  currency: string;
  active: boolean;
}

const DEVELOPMENT_OFFERS: Record<string, ServiceOffer> = {
  wash_fold: { serviceType: 'wash_fold', amountCents: 1599, currency: 'USD', active: true },
  dry_cleaning: { serviceType: 'dry_cleaning', amountCents: 2499, currency: 'USD', active: true },
  ironing: { serviceType: 'ironing', amountCents: 1299, currency: 'USD', active: true },
  express: { serviceType: 'express', amountCents: 2999, currency: 'USD', active: true },
};

function normalizeOffer(serviceType: string, value: unknown): ServiceOffer {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Jiffy service catalog entry ${serviceType} must be an object`);
  }
  const record = value as Record<string, unknown>;
  const amountCents = Number(record.amountCents ?? record.amount_cents);
  const currency = String(record.currency ?? 'USD').trim().toUpperCase();
  const active = record.active !== false;
  if (!Number.isSafeInteger(amountCents) || amountCents < 0) {
    throw new Error(`Jiffy service catalog entry ${serviceType} has invalid amountCents`);
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error(`Jiffy service catalog entry ${serviceType} has invalid currency`);
  }
  return { serviceType, amountCents, currency, active };
}

export function configuredServiceCatalog(): Record<string, ServiceOffer> | null {
  const raw = process.env.JIFFY_SERVICE_CATALOG_JSON?.trim();
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('JIFFY_SERVICE_CATALOG_JSON must be valid JSON');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JIFFY_SERVICE_CATALOG_JSON must be an object keyed by service type');
  }
  const catalog: Record<string, ServiceOffer> = {};
  for (const [serviceType, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!/^[a-z0-9_-]{2,64}$/.test(serviceType)) throw new Error(`Invalid Jiffy service type ${serviceType}`);
    catalog[serviceType] = normalizeOffer(serviceType, value);
  }
  return catalog;
}

export function serviceCatalogState() {
  try {
    const configured = configuredServiceCatalog();
    return {
      configured: Boolean(configured),
      productionReady: process.env.NODE_ENV !== 'production' || Boolean(configured),
      services: Object.keys(configured ?? DEVELOPMENT_OFFERS),
      error: null as string | null,
    };
  } catch (error) {
    return {
      configured: true,
      productionReady: false,
      services: [] as string[],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function resolveServiceOffer(serviceType: string): ServiceOffer {
  const configured = configuredServiceCatalog();
  if (process.env.NODE_ENV === 'production' && !configured) {
    throw Object.assign(new Error('Jiffy production service catalog is not configured'), { statusCode: 503 });
  }
  const catalog = configured ?? DEVELOPMENT_OFFERS;
  const offer = catalog[serviceType];
  if (!offer || !offer.active) {
    throw Object.assign(new Error('Service is not currently sellable'), { statusCode: 409 });
  }
  return offer;
}
