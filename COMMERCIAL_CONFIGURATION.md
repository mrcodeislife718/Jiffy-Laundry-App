# Jiffy Laundry commercial configuration

Production service prices are product-owned configuration, not route constants.

Set `JIFFY_SERVICE_CATALOG_JSON` in the deployment secret/configuration environment. It is a JSON object keyed by service type. Each entry must contain an integer `amountCents`; `currency` defaults to `USD`; `active` defaults to `true`.

Example shape only:

```json
{
  "wash_fold": { "amountCents": 1599, "currency": "USD", "active": true },
  "dry_cleaning": { "amountCents": 2499, "currency": "USD", "active": true }
}
```

The example values preserve the repository's prior development behavior; they are not a directive for production pricing. Production fails closed when the catalog is absent, when an entry is malformed, or when the requested service is not active. This allows operating costs, geography, promotions, packaging and price changes to be managed intentionally without editing the order route.
