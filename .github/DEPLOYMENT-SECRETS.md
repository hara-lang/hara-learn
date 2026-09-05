# Hara Learn deployment credentials

GitHub Actions is the only deployment authority. The workflow requires one
repository secret and two repository variables:

```text
secret: HARA_NETLIFY_AUTH_TOKEN
variable: HARA_LEARN_NETLIFY_TESTING_SITE_ID
variable: HARA_LEARN_NETLIFY_PRODUCTION_SITE_ID
```

`HARA_NETLIFY_AUTH_TOKEN` must be a Netlify personal access token or equivalent
credential with permission to deploy both Learn projects. It is stored only as a
GitHub Actions secret and is bound to the provider-native `NETLIFY_AUTH_TOKEN`
name only for the deploy command. It is never a Netlify Function runtime value.

The two site IDs are non-secret identifiers held as GitHub Actions variables;
the workflow selects them by branch:

```text
testing branch -> HARA_LEARN_NETLIFY_TESTING_SITE_ID
main branch    -> HARA_LEARN_NETLIFY_PRODUCTION_SITE_ID
```

Production must use a separate Netlify project and its own site ID.

## Function runtime boundary

Netlify Functions do not inherit GitHub Actions secrets. Runtime values are
configured directly at the declared Netlify site and `production` context:

```text
DATABASE_URL
HARA_IDENTITY_HANDOFF_SECRET
HARA_LEARN_SESSION_SECRET
HARA_LEARN_GITHUB_APP_ID
HARA_LEARN_GITHUB_APP_PRIVATE_KEY
HARA_LEARN_GITHUB_INSTALLATION_ID
HARA_LEARN_GITHUB_WEBHOOK_SECRET
```

Testing and production use different database, handoff/session, GitHub App,
and webhook values. The deployment workflow must be rerun through GitHub after
a runtime update so the new Function configuration is active. Do not sync a
GitHub deployment credential into Netlify as a runtime variable.

## Proposal lifecycle deployment

Before proposal dashboards can report GitHub review state:

1. apply `database/migrations/005_community_proposals.sql` to the environment's Neon database;
2. generate a different high-entropy webhook secret for testing and production;
3. set the Netlify environment variable:

```text
HARA_LEARN_GITHUB_WEBHOOK_SECRET
```

4. configure the Hara Learn GitHub App webhook URL for each environment:

```text
https://learn.testing.hara-lang.org/api/github/events
https://learn.hara-lang.org/api/github/events
```

5. subscribe the App to Pull request, Pull request review, Pull request review comment, Check run, and Check suite events;
6. ensure the App retains Contents and Pull requests write permission, repository Metadata read permission, and Checks read permission for complete reconciliation.

The webhook secret belongs in Netlify, not GitHub Actions. The GitHub App configuration must use the matching value. Testing and production must not share it.

After configuring deployment secrets and environment variables, manually dispatch `Deploy learn.hara-lang.org` and require its validation, deploy, domain reconciliation, active readiness, and logout verification steps to pass. `/.well-known/hara-learn-readiness` now remains unavailable when the proposal migration or webhook secret is missing.
