# Release 1 connector agent structure

Release 1 is the February 2027 sandbox demo described in the proposal: a guided workflow for up to three REST applications. Agents prepare recommendations; fixed code validates and builds the configuration; a Saviynt expert approves a specific version. Agents do not receive secrets or call Saviynt.

## User conversation

Ask one small group of questions at a time. Allow “I don't know” and assign the gap to a person instead of guessing.

1. **Application:** What is the application name, environment, owner, and technical contact?
2. **API:** What is the HTTPS base URL? Is there an OpenAPI document or API guide?
3. **Authentication:** Which pattern is used (OAuth client credentials, API key, Basic, other)? Who can configure it in the secrets store? Never request the credential value.
4. **Accounts:** What endpoint returns accounts? Which field is the stable unique ID? How does pagination work?
5. **Entitlements:** What endpoint returns groups/roles, and how are they linked to accounts?
6. **Lifecycle:** Is the pilot import-only, or should it also create, update, disable, or delete accounts? What non-production account can safely be used?
7. **Evidence:** Can the owner provide a sanitized sample response and confirm the proposed field meanings?
8. **Review:** Who is the Saviynt SME approving this version, and which sandbox will be used?

The UI should warn against uploading production records, tokens, secrets, or personal data. The Intake Agent should redact sample data before any other model call and show what it removed.

## Fixed workflow

```text
Application owner
  -> Intake Agent: collect answers, documents, sample; report gaps and owners
  -> Analysis Agent: identify endpoints, authentication pattern, pagination, operations
  -> Mapping Agent: propose Saviynt fields with evidence and confidence
  -> Configuration service: render a versioned connector from approved templates
  -> Validation service: schema checks and sanitized fixture tests; failures block approval
  -> Saviynt SME: approve the exact immutable version
  -> Integration service: use sandbox credentials from the secrets store, create once
  -> Import verification: compare imported accounts/entitlements to expected fixtures
  -> Documentation Agent: produce runbook and handoff package
```

Every step stores its input references, output, timestamp, and actor. A change creates a new version and clears approval. The integration service uses an idempotency key and records the Saviynt response so retries cannot silently create a duplicate endpoint.

## Connector draft contract

Keep the agent output structured and constrained. The model proposes values; application code validates and renders the final Saviynt payload.

```json
{
  "application": { "name": "Example", "environment": "sandbox" },
  "connection": {
    "baseUrl": "https://api.example.test/v1",
    "authType": "oauth_client_credentials",
    "secretReference": "vault://onboarding/example-api"
  },
  "operations": [
    { "name": "accounts", "method": "GET", "path": "/users", "pagination": "next_link" },
    { "name": "entitlements", "method": "GET", "path": "/groups", "pagination": "next_link" }
  ],
  "mappings": [
    { "source": "id", "target": "accountId", "evidence": "sanitized-sample.json#/users/0/id", "confidence": 0.98, "confirmedByOwner": false }
  ],
  "version": 1,
  "approval": null
}
```

Never put a credential value in this contract, an agent prompt, a document, or an audit event. Store only a secret reference. Require evidence for each mapping and leave uncertain mappings unconfirmed.

## Current implementation boundary

The assessment tab now runs four separate, deterministic guided agents in a fixed order. The Intake Agent checks answers and redacts secret-like fields, emails, and phone numbers from JSON evidence. The Analysis Agent matches owner paths against OpenAPI JSON. The Mapping Agent proposes fields from sample structure. Fixed code validates the draft, and the Documentation Agent creates a runbook. Docker Compose runs PostgreSQL for agent results and exact-version approvals; agent APIs require an authenticated session, and only an admin can approve.

These are local rule-based agents, not model-backed AI. The pilot still needs model-backed document interpretation, stronger evidence redaction review, Saviynt-specific payload templates, target endpoint checks, fixture import verification, and a sandbox integration service. The agent workflow does not contact a target API or Saviynt.
