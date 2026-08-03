# AntigravityOS data storage

AntigravityOS is a browser-only demonstration. Runtime data is saved as JSON in
the browser's `localStorage` for the page's origin. It is not written back into
JavaScript files on disk.

## Static administrator account

`credentials.js` defines the built-in Admin username, email, password, and root
password. The Admin profile is intentionally read-only in the interface.

The current package includes a one-time reset marker,
`antigravity-clean-user-reset-2026-07-15`. On first launch it removes all
previously stored users, companies, account requests, installations, pins, and
IDE files. The only remaining account is the static Local Admin account from
`credentials.js` (`admin` / `admin123`). This built-in Admin account cannot be
used for server-mode login.

## Browser-storage keys

- `antigravity-local-users`: Managed users created by Admin. Each object stores
  `id`, `username`, `email`, the demo password, and `companyId`. A `companyId`
  of `local` is a Local account; other values connect the user to one registered
  company.
- `antigravity-companies`: Registered company names, connection modes, and
  normalized server addresses.
- `antigravity-company-change-requests`: Pending and resolved company name, ID,
  and domain change requests reviewed by the Local/Master Admin.
- `antigravity-mail-messages`: Internal Mail messages, recipients, timestamps,
  per-recipient read state, and automatic account-request notifications
  synchronized through MySQL. `deletedBy` records per-account mailbox removal.
- `antigravity-branding`: Master-Admin-controlled visible system name and
  version synchronized through MySQL.
- `antigravity-password-reset-requests`: Pending, approved, or rejected password
  reset requests.
- `antigravity-profile-requests`: Pending username/email change requests.
- `antigravity-profile-request-history`: Resolved profile-change outcomes.
- `antigravity-installed-apps:<username>`: Optional apps installed by a user.
- `antigravity-pinned-apps:<username>`: Apps pinned to that user's taskbar.
- `antigravity-ide-files:<username>`: Antigravity IDE virtual files.
- `antigravity-files:<tenant>:<username>:home`: The user's persistent Files
  hierarchy, imported file data, metadata, and folder structure.
- `antigravity-files:<tenant>:<username>:root`: The separate elevated Files
  hierarchy opened through Sudo.
- `antigravity-gravity-chat-messages`: MySQL-synchronized Gravity Chat
  conversations and per-recipient read state.
- `antigravity-gravity-chat-contacts:<account-id>`: Synchronized Gravity Chat
  contacts added by each account.
- `antigravity-calendar-v2:<account-id>`: Synchronized Calendar events, tasks,
  and reminders.
- `ag-docs-v2:<account-id>` and `ag-sheets-v2:<account-id>`: Synchronized saved
  productivity documents and workbooks.
- `antigravity-accent:<tenant>:<username>`: MySQL-synchronized per-user
  interface accent color.

The Admin **Company Registration** app exposes an **Export Users** button for
each company. It downloads a separate `.users.json` file using the sample format
in `System/Users/example-company.users.json`.

## Viewing the saved values

Open the browser developer tools, select **Application** (or **Storage**), open
**Local Storage**, and select the AntigravityOS page origin. The keys above can
be inspected there.

This design is suitable for a UI prototype only. A real deployment should keep
users, password hashes, companies, and requests in a server-side database and
expose them through an authenticated API.
