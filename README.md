# Jiffy Laundry

**An end-to-end laundry pickup, delivery, logistics, and operations platform.**

Jiffy Laundry connects customers, laundry staff, drivers, administrators, payments, dispatch, order tracking, and business intelligence inside one operating system for modern laundry services.

It is not a simple booking page. Jiffy Laundry is designed to manage the complete service lifecycle from order creation through pickup, processing, delivery, payment, support, and operational reporting.

## Mission

Jiffy Laundry is designed to make laundry service faster and easier for customers while giving operators the control required to run dependable pickup-and-delivery operations at scale.

Its goals are to:

- provide customers with clear ordering, scheduling, pricing, and status visibility;
- coordinate pickup and delivery through structured dispatch workflows;
- give staff a reliable operating queue for receiving, processing, quality control, and release;
- give drivers route, assignment, proof-of-service, and status tools;
- centralize customer support, payments, notifications, refunds, and issue resolution;
- preserve operational history and analytics across every order;
- support one-location operators, multi-location businesses, and broader laundry-service networks.

## Product surfaces

### Customer experience

- account and profile management;
- service and pricing selection;
- pickup and delivery scheduling;
- address and contact management;
- special instructions;
- order confirmation and status tracking;
- payments, receipts, and order history;
- notifications and support.

### Staff operations

- incoming-order queue;
- intake and item or bag tracking;
- service-stage updates;
- processing and quality-control workflows;
- exception and damage reporting;
- readiness and release management;
- customer and order communication.

### Driver operations

- assigned pickup and delivery queue;
- route and stop information;
- customer contact and delivery instructions;
- pickup and delivery status;
- proof-of-service records;
- exception and failed-attempt workflows;
- earnings or work-history support where applicable.

### Administrative command center

- order and customer management;
- staff and driver administration;
- dispatch and assignment;
- service, pricing, and operating-area configuration;
- payment, refund, and revenue visibility;
- role-based access control;
- issue and support management;
- analytics and operational reporting.

## Service lifecycle

```text
Customer creates order
    -> service and address validated
    -> pickup window scheduled
    -> payment or authorization recorded
    -> driver assigned
    -> pickup completed
    -> laundry received and processed
    -> quality control completed
    -> delivery scheduled and assigned
    -> delivery completed
    -> receipt and final status issued
    -> feedback, support, retention, and reporting
```

## Intended platform architecture

```text
Product applications
├── Customer web and mobile experience
├── Staff operations application
├── Driver application
└── Administrative command center
              │
              ▼
Identity and authority
├── Customer accounts
├── Staff and driver identities
├── Administrative roles
├── Authentication
└── Role-based access control
              │
              ▼
Core services
├── Customer and address service
├── Order service
├── Service and pricing engine
├── Scheduling service
├── Dispatch and assignment engine
├── Laundry workflow service
├── Driver and route service
├── Payment and refund service
├── Notification service
└── Support and exception service
              │
              ▼
Operational state
├── Order status and timeline
├── Pickup and delivery events
├── Processing and quality-control events
├── Payment records
├── Assignment and route history
├── Communications
└── Audit records
              │
              ▼
Business intelligence
├── Order volume and completion
├── Revenue and payment reporting
├── Service and location performance
├── Driver and staff operations
├── Customer retention
├── Exceptions and failed attempts
└── Capacity and dispatch intelligence
```

## Current repository foundation

The current repository contains a TypeScript pnpm workspace with shared application, API, database, and integration packages.

The implementation foundation includes:

- React 19 product surfaces;
- Vite-based web application infrastructure;
- Express 5 API services;
- Drizzle ORM data access;
- Zod request and domain validation;
- TanStack Query client-state and data-fetching support;
- Tailwind CSS and reusable interface components;
- shared API and database packages;
- order creation, retrieval, status, statistics, update, and deletion workflows;
- administrative product surfaces;
- structured logging;
- supply-chain protections through pnpm minimum-release-age policy;
- TypeScript build and type-check workflows.

The repository represents an active product implementation. Capabilities described as intended architecture are not presented as completed unless they are supported by the current source.

## Core order domain

A Jiffy Laundry order is intended to bind:

- customer identity and contact information;
- service selection;
- pickup and delivery addresses;
- scheduling windows;
- special instructions;
- estimated and final pricing;
- payment state;
- driver and staff assignments;
- processing status;
- pickup, facility, and delivery events;
- exceptions, support records, and customer communications;
- complete timeline and audit history.

## Security and operational controls

- Role-based customer, staff, driver, and administrative access
- Validated API contracts
- Protected credentials and environment configuration
- No unrestricted cross-role access
- Auditable order and status changes
- Payment and refund authority boundaries
- Assignment and dispatch history
- Supply-chain dependency protections
- Structured error and exception handling
- Customer-data and operational privacy controls

## Build

The repository requires pnpm.

```bash
pnpm install
pnpm run build
```

The root build performs TypeScript validation and builds supported workspace packages.

## Commercial direction

Jiffy Laundry is designed for:

- independent laundry operators;
- pickup-and-delivery laundry companies;
- dry-cleaning and garment-care businesses;
- multi-location operators;
- campuses, buildings, hospitality properties, and managed communities;
- licensed or white-label service networks.

Revenue can be supported through consumer service fees, delivery fees, subscriptions, business accounts, commercial contracts, operating-software plans, and licensed deployments.

## Repository boundary

This repository contains the controlled Jiffy Laundry application foundation. Production credentials, customer information, payment-provider configuration, private deployment settings, operational agreements, and security-sensitive infrastructure must remain outside public source control.

## Ownership and licensing

Jiffy Laundry is independently designed and developed by **Charles Castillo**, Software Engineer and AI Systems Engineer.

All rights reserved for Jiffy Laundry architecture, branding, product design, operational systems, and commercial use. Third-party and repository source licenses remain governed by their applicable files and package terms.
