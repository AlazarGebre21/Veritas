# GET /invoices EnterpriseAdmin Endpoint

## 📌 Description

Returns invoices for the specified enterprise.

---

## 🔐 Headers

| Name            | Type   | Required | Description          |
| --------------- | ------ | -------- | -------------------- |
| X-Enterprise-ID | string | ✅ Yes   | Enterprise ID (UUID) |

---

## 🔍 Query Parameters

| Name     | Type    | Required | Description                                                                                                                      |
| -------- | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| page     | integer | ❌ No    | Page number (default: 1)                                                                                                         |
| limit    | integer | ❌ No    | Items per page (default: 10)                                                                                                     |
| sort     | string  | ❌ No    | Sort field (allowed: `amount_due`, `amount_paid`, `amount_remaining`, `due_date`, `status`, `created_at`; default: `created_at`) |
| sort_dir | string  | ❌ No    | Sort direction (`asc` or `desc`)                                                                                                 |

---

## 📥 Response

### ✅ 200 OK

**Content-Type:** `application/json`

### Example Response

```json
{
  "data": [
    {
      "amount_due": 0,
      "amount_paid": 0,
      "amount_remaining": 0,
      "created_at": "string",
      "currency": "ETB",
      "due_date": "string",
      "enterprise_id": "string",
      "hosted_invoice_url": "string",
      "id": "string",
      "invoice_pdf_url": "string",
      "number": "string",
      "paid_at": "string",
      "status": "Draft",
      "subscription_id": "string",
      "updated_at": "string"
    }
  ],
  "metadata": {
    "current_page": 0,
    "has_next": true,
    "has_previous": true,
    "page_size": 0,
    "total_elements": 0,
    "total_pages": 0
  }
}
```

# GET /invoices/{invoiceId} EnterpriseAdmin Endpoint

## 📌 Description

Fetch a single invoice by invoice ID.

---

## 🔗 Path Parameters

| Name      | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| invoiceId | string | ✅ Yes   | Invoice ID (UUID) |

---

## 📥 Response

### ✅ 200 OK

**Content-Type:** `application/json`

### Example Response

```json
{
  "amount_due": 0,
  "amount_paid": 0,
  "amount_remaining": 0,
  "created_at": "string",
  "currency": "ETB",
  "due_date": "string",
  "enterprise_id": "string",
  "hosted_invoice_url": "string",
  "id": "string",
  "invoice_pdf_url": "string",
  "number": "string",
  "paid_at": "string",
  "status": "Draft",
  "subscription_id": "string",
  "updated_at": "string"
}
```

# GET /payments/history EnterpriseAdmin Endpoint

## 📌 Description

Returns payment history for the specified enterprise.

---

## 🔐 Headers

| Name            | Type   | Required | Description   |
| --------------- | ------ | -------- | ------------- |
| X-Enterprise-ID | string | ✅ Yes   | Enterprise ID |

---

## 🔍 Query Parameters

| Name     | Type    | Required | Description                                                                                          |
| -------- | ------- | -------- | ---------------------------------------------------------------------------------------------------- |
| page     | integer | ❌ No    | Page number (default: 1)                                                                             |
| limit    | integer | ❌ No    | Items per page (default: 10)                                                                         |
| sort     | string  | ❌ No    | Sort field (allowed: `amount`, `status`, `payment_method_type`, `created_at`; default: `created_at`) |
| sort_dir | string  | ❌ No    | Sort direction (`asc` or `desc`)                                                                     |

---

## 📥 Response

### ✅ 200 OK

**Content-Type:** `application/json`

### Example Response

```json
{
  "data": [
    {
      "amount": 0,
      "created_at": "string",
      "currency": "ETB",
      "enterprise_id": "string",
      "id": "string",
      "invoice_id": "string",
      "notes": "string",
      "payment_method_type": "string",
      "provider": "string",
      "provider_error_code": "string",
      "provider_error_message": "string",
      "provider_payment_id": "string",
      "status": "Pending"
    }
  ],
  "metadata": {
    "current_page": 0,
    "has_next": true,
    "has_previous": true,
    "page_size": 0,
    "total_elements": 0,
    "total_pages": 0
  }
}
```

# GET /payments/{paymentId} EnterpriseAdmin and SystemAdmin Endpoint

## 📌 Description

Retrieve a single payment by its ID.  
Accessible by enterprise admins or system admins.

---

## 🔗 Path Parameters

| Name      | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| paymentId | string | ✅ Yes   | Payment UUID |

---

## 📥 Response

### ✅ 200 OK

**Content-Type:** `application/json`

### Example Response

```json
{
  "amount": 0,
  "created_at": "string",
  "currency": "ETB",
  "enterprise_id": "string",
  "id": "string",
  "invoice_id": "string",
  "notes": "string",
  "payment_method_type": "string",
  "provider": "string",
  "provider_error_code": "string",
  "provider_error_message": "string",
  "provider_payment_id": "string",
  "status": "Pending"
}
```

# POST /admin/subscriptions/{enterpriseId} SystemAdmin Endpoint

## 📌 Description

Manually override an enterprise's subscription plan and status.  
This operation is performed **without calling external payment providers (e.g., Stripe)**.

---

## 🔗 Path Parameters

| Name         | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| enterpriseId | string | ✅ Yes   | Enterprise ID (UUID) |

---

## 📦 Request Body

**Content-Type:** `application/json`

### Example Request Body

```json
{
  "period_start": "string",
  "period_end": "string",
  "plan_id": "string",
  "status": "string"
}
```

# GET /subscriptions/plans PUBLIC Endpoint

## 📌 Description

Returns all available subscription plans.

---

## 🔍 Query Parameters

| Name     | Type    | Required | Description                                                                |
| -------- | ------- | -------- | -------------------------------------------------------------------------- |
| page     | integer | ❌ No    | Page number (default: 1)                                                   |
| limit    | integer | ❌ No    | Items per page (default: 10)                                               |
| sort     | string  | ❌ No    | Sort field (allowed: `price`, `name`, `created_at`; default: `created_at`) |
| sort_dir | string  | ❌ No    | Sort direction (`asc` or `desc`)                                           |

---

## 📥 Response

### ✅ 200 OK

**Content-Type:** `application/json`

### Example Response

```json
{
  "data": [
    {
      "billing_cycle": "monthly",
      "created_at": "string",
      "currency": "ETB",
      "description": "string",
      "features": {
        "additionalProp1": "string",
        "additionalProp2": "string",
        "additionalProp3": "string"
      },
      "id": "string",
      "is_active": true,
      "name": "string",
      "price": 0,
      "slug": "string",
      "stripe_price_id": "string",
      "updated_at": "string"
    }
  ],
  "metadata": {
    "current_page": 0,
    "has_next": true,
    "has_previous": true,
    "page_size": 0,
    "total_elements": 0,
    "total_pages": 0
  }
}
```

# GET /subscriptions/{enterpriseId} EnterpriseAdmin and SystemAdmin Endpoint

## 📌 Description

Returns the current active subscription state for a specific enterprise.

---

## 🔗 Path Parameters

| Name         | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| enterpriseId | string | ✅ Yes   | Enterprise ID (UUID) |

---

## 📥 Response

### ✅ 200 OK

**Content-Type:** `application/json`

### Example Response

```json
{
  "cancel_at_period_end": true,
  "canceled_at": "string",
  "created_at": "string",
  "current_period_end": "string",
  "current_period_start": "string",
  "ended_at": "string",
  "enterprise_id": "string",
  "id": "string",
  "plan_id": "string",
  "status": "Active",
  "stripe_customer_id": "string",
  "stripe_subscription_id": "string",
  "updated_at": "string"
}
```

# POST /subscriptions/{enterpriseId}/cancel EnterpriseAdmin Endpoint

## 📌 Description

Cancels an enterprise subscription either immediately or at the end of the current billing period.

---

## 🔗 Path Parameters

| Name         | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| enterpriseId | string | ✅ Yes   | Enterprise ID (UUID) |

---

## 📦 Request Body

**Content-Type:** `application/json`

### Example Request Body

```json
{
  "cancel_at_period_end": true
}
```

# POST /subscriptions/{enterpriseId}/reactivate EnterpriseAdmin Endpoint

## 📌 Description

Reactivates a subscription that was previously scheduled for cancellation.  
This cancels the pending period-end cancellation and keeps the subscription active.

---

## 🔗 Path Parameters

| Name         | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| enterpriseId | string | ✅ Yes   | Enterprise ID (UUID) |

---

## 📥 Response

### ✅ 204 No Content

- The request was successful.
- No response body is returned.

# POST /subscriptions/{enterpriseId}/upgrade EnterpriseAdmin Endpoint

## 📌 Description

Creates a payment provider checkout session to upgrade an enterprise subscription plan.

---

## 🔗 Path Parameters

| Name         | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| enterpriseId | string | ✅ Yes   | Enterprise ID (UUID) |

---

## 📦 Request Body

**Content-Type:** `application/json`

### Example Request Body

```json
{
  "plan_id": "string",
  "provider": "string"
}
```

## POST /webhooks/chapa PUBLIC ENDPOINT

### Handle Chapa Webhook

Validates and processes a Chapa webhook event payload.

---

### Parameters

| Name                | Type     | Location | Description                 |
| ------------------- | -------- | -------- | --------------------------- |
| `chapa-signature`   | `string` | Header   | Chapa webhook signature     |
| `x-chapa-signature` | `string` | Header   | Alternative Chapa signature |
| `payload`           | `string` | Body     | Raw webhook payload         |

#### Request Body

**Content-Type:** `application/json`

##### Example Value

```json
"string"
```

---

### Responses

**Response Content-Type:** `application/json`

| Code  | Description |
| ----- | ----------- |
| `200` | OK          |

# POST /webhooks/stripe PUBLIC Endpoint

## 📌 Description

Handles incoming Stripe webhook events.  
This endpoint validates the webhook signature and processes the event payload.

---

## 🔐 Headers

| Name             | Type   | Required | Description              |
| ---------------- | ------ | -------- | ------------------------ |
| Stripe-Signature | string | ✅ Yes   | Stripe webhook signature |

---

## 📦 Request Body

**Content-Type:** `application/json`

### Example Payload

```json

  string

```

## Response

- ok

# POST /admin/invoices/{invoiceId}/refund SystemAdmin Endpoint

## 📌 Description

Refunds a specific invoice by its ID.  
This endpoint is intended for **admin use only** and is typically used for full or partial refunds.

---

## 🔗 Path Parameters

| Name      | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| invoiceId | string | ✅ Yes   | Invoice ID (UUID) |

---

## 📦 Request Body

**Content-Type:** `application/json`

### Example Request Body

```json
{
  "amount": 0,
  "reason": "string"
}
```

# Response

- 204 No Content
  The refund request was successfully processed.
  No response body is returned.

# GET /admin/plans SystemAdmin Endpoint

## 📌 Description

Returns all subscription plans, including inactive ones.  
This endpoint is intended for **admin use only**.

---

## 🔍 Query Parameters

| Name     | Type    | Required | Description                                                                |
| -------- | ------- | -------- | -------------------------------------------------------------------------- |
| page     | integer | ❌ No    | Page number (default: 1)                                                   |
| limit    | integer | ❌ No    | Items per page (default: 10)                                               |
| sort     | string  | ❌ No    | Sort field (allowed: `price`, `name`, `created_at`; default: `created_at`) |
| sort_dir | string  | ❌ No    | Sort direction (`asc` or `desc`)                                           |

---

## 📥 Response

### ✅ 200 OK

**Content-Type:** `application/json`

### Example Response

```json
{
  "data": [
    {
      "billing_cycle": "monthly",
      "created_at": "string",
      "currency": "ETB",
      "description": "string",
      "features": {
        "additionalProp1": "string",
        "additionalProp2": "string",
        "additionalProp3": "string"
      },
      "id": "string",
      "is_active": true,
      "name": "string",
      "price": 0,
      "slug": "string",
      "stripe_price_id": "string",
      "updated_at": "string"
    }
  ],
  "metadata": {
    "current_page": 0,
    "has_next": true,
    "has_previous": true,
    "page_size": 0,
    "total_elements": 0,
    "total_pages": 0
  }
}
```

# POST /admin/plans

## 📌 Description

Creates a new subscription plan.  
This endpoint is intended for **system admin use only**.

---

## 📦 Request Body

**Content-Type:** `application/json`

### Example Request Body

```json
{
  "billing_cycle": "string",
  "currency": "string",
  "description": "string",
  "features": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "is_active": true,
  "name": "string",
  "price": 0,
  "slug": "string",
  "stripe_price_id": "string"
}
```

# POST /admin/plans SystemAdmin Endpoint

## 📌 Description

Creates a new subscription plan.  
This endpoint is intended for **system admin use only**.

---

## 📦 Request Body

**Content-Type:** `application/json`

### Example Request Body

```json
{
  "billing_cycle": "string",
  "currency": "string",
  "description": "string",
  "features": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "is_active": true,
  "name": "string",
  "price": 0,
  "slug": "string",
  "stripe_price_id": "string"
}
```

# Response

```json
{
  "billing_cycle": "monthly",
  "created_at": "string",
  "currency": "ETB",
  "description": "string",
  "features": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "id": "string",
  "is_active": true,
  "name": "string",
  "price": 0,
  "slug": "string",
  "stripe_price_id": "string",
  "updated_at": "string"
}
```

# DELETE /admin/plans/{planId} SystemAdmin Endpoint

## 📌 Description

Deactivates a subscription plan by setting `is_active = false`.  
This endpoint is intended for **system admin use only**.

---

## 🔗 Path Parameters

| Name   | Type   | Required | Description    |
| ------ | ------ | -------- | -------------- |
| planId | string | ✅ Yes   | Plan ID (UUID) |

---

## 📥 Response

### ✅ 204 No Content

- The plan was successfully deactivated.
- No response body is returned.

---

# PATCH /admin/plans/{planId} SystemAdmin Endpoint

## 📌 Description

Updates an existing subscription plan.  
This endpoint is intended for **system admin use only**.

---

## 🔗 Path Parameters

| Name   | Type   | Required | Description    |
| ------ | ------ | -------- | -------------- |
| planId | string | ✅ Yes   | Plan ID (UUID) |

---

## 📦 Request Body

**Content-Type:** `application/json`

### Example Request Body

```json
{
  "billing_cycle": "string",
  "currency": "string",
  "description": "string",
  "features": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "is_active": true,
  "name": "string",
  "price": 0,
  "slug": "string",
  "stripe_price_id": "string"
}
```

# Response

```json
{
  "billing_cycle": "monthly",
  "created_at": "string",
  "currency": "ETB",
  "description": "string",
  "features": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "id": "string",
  "is_active": true,
  "name": "string",
  "price": 0,
  "slug": "string",
  "stripe_price_id": "string",
  "updated_at": "string"
}
```

# POST /admin/subscriptions/{enterpriseId}/trial SystemAdmin Endpoint

## 📌 Description

Starts a free trial subscription for an enterprise without requiring a payment method.

---

## 🔗 Path Parameters

| Name         | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| enterpriseId | string | ✅ Yes   | Enterprise ID (UUID) |

---

## 📦 Request Body

**Content-Type:** `application/json`

### Example Request Body

```json
{
  "plan_id": "string",
  "trial_days": 0
}
```

# Response

- No content

# GET /billing/summary EnterpriseAdmin Endpoint

## 📌 Description

Returns aggregated billing details for an enterprise, including:

- Current subscription plan
- Subscription status
- Payment history summary
- Balances and upcoming billing info

---

## 🔐 Headers

| Name            | Type   | Required | Description          |
| --------------- | ------ | -------- | -------------------- |
| X-Enterprise-ID | string | ✅ Yes   | Enterprise ID (UUID) |

---

## 📥 Response

### ✅ 200 OK

**Content-Type:** `application/json`

### Example Response

```json
{
  "active_plan_name": "string",
  "last_payment": {
    "amount": 0,
    "created_at": "string",
    "currency": "ETB",
    "enterprise_id": "string",
    "id": "string",
    "invoice_id": "string",
    "notes": "string",
    "payment_method_type": "string",
    "provider": "string",
    "provider_error_code": "string",
    "provider_error_message": "string",
    "provider_payment_id": "string",
    "status": "Pending"
  },
  "next_billing_date": "string",
  "outstanding_balance": 0,
  "subscription_status": "Active",
  "total_paid_ytd": 0
}
```

# GET /billing/usage/{enterpriseId}

## 📌 Description

Returns the feature set of the active subscription plan for an enterprise.  
This endpoint is primarily used **internally by other services** to enforce plan-based limits and access control.

---

## 🔗 Path Parameters

| Name         | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| enterpriseId | string | ✅ Yes   | Enterprise ID (UUID) |

---

## 📥 Response

### ✅ 200 OK

**Content-Type:** `application/json`

### Example Response

```json
{
  "plan_features": {
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  }
}
```
