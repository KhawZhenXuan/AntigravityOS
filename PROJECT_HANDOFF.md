# AntigravityOS Project Handoff

Last reviewed: 2026-07-15

## Purpose

This file is the portable project record for AntigravityOS. Give the entire
`outputs` folder to a new ChatGPT/Codex session and ask it to read this file
before editing anything.

When a change is completed, update the **Change log**, **Current state**, and
**Remaining work / limitations** sections. Do not claim a feature is complete
until it has been tested in a browser.

## Start here

The application entry point is:

- `AntigravityOS.html`

Open that file in a browser. It loads these active supporting scripts, in this
order:

1. `System/Resources/credentials.js`
2. `System/Resources/requests.js`
3. `System/Resources/apps.js`
4. `System/Resources/installations.js`

Important: `System/apps.js` and `System/installations.js` are duplicate/legacy
copies and are **not loaded** by `AntigravityOS.html`. The active files are the
ones inside `System/Resources`. Do not edit only the legacy copies and expect
the running app to change.

## Current architecture

- Front-end-only HTML/CSS/JavaScript prototype; there is no backend.
- The primary UI, styling, window manager, terminal, authentication flow, and
  built-in application renderers live in the single `AntigravityOS.html` file.
- Optional/store applications are registered by
  `System/Resources/apps.js` through `window.ANTIGRAVITY_OPTIONAL_APPS`.
- Demo credentials come from `System/Resources/credentials.js` through
  `window.ANTIGRAVITY_AUTH`.
- Request and installation seed files initialize empty arrays; runtime changes
  are stored in browser `localStorage`.
- The built-in demo Admin credentials and root password are currently
  `admin` / `admin123`. These are public client-side demo values, not secure
  authentication.

## Current state: implemented features

### Startup and authentication

- Mode selection for Local or Server connection.
- Official AntigravityOS and self-hosted server address flows.
- Boot/progress screen before login.
- Local Admin login and managed local/company user accounts.
- First-time password creation for managed accounts.
- Password visibility controls.
- Password reset request, Admin approval/rejection, and completion flows.
- Logout confirmation dialog.

### Desktop and windows

- Desktop-style interface with a bottom icon taskbar.
- Start button and Start menu with reboot, shutdown, and logout actions.
- Apps launcher.
- Terminal opens automatically as the default window after login.
- Terminal cannot be closed; it can be moved, minimized, maximized/restored,
  and resized.
- Application windows are draggable, resizable, minimizable, maximizable, and
  focusable.
- Applications use a single-instance model. Opening an already-running app
  restores and focuses its existing window instead of creating a duplicate.
- Running apps appear on the taskbar; apps may also be pinned through Settings.
- The original decorative red, yellow, and green window dots and the old empty
  sidebar were removed.

### Terminal and privileges

- Command history, arrow-key navigation, Tab completion, and Ctrl+L clearing.
- Commands include `help`, `clear`, `apps`, `open`, `launch`, `sudo`, `su`,
  `exit`, `close`, `closeall`, `date`, `time`, `whoami`, `hostname`, `pwd`,
  `ls`, `echo`, `theme`, `history`, `banner`, `about`, `status`, `reboot`, and
  `logout`.
- `sudo open <app>` launches an elevated app window with distinct root styling.
- `sudo su` / `su -` enters the root shell; `exit` leaves the root shell.
- App listings identify apps that are already open and whether the open window
  is elevated.
- Logout is available from the Start menu, top-level UI flow, and terminal with
  confirmation.

### Built-in applications

- Help
- Mail (permanent internal mail with inbox, sent mail, compose, replies,
  cross-company delivery, and recipient autocomplete)
- Antigravity IDE with virtual files, import, export, save, rename, and new file
- Antigravity Store for optional application installation/uninstallation
- Files
- System information
- Settings, including theme, data reset, app management, and taskbar pins
- Add User (Admin)
- Profile and password management
- Profile Change Requests (Admin)
- Company Registration and company-user export (Admin)
- Password Reset Requests (Admin)
- Company contacts/messaging support is implemented in the main HTML renderer.

### Optional/store applications in the active catalog

- Audio Player
- Video Player
- Docs
- Sheets
- Slides
- Contacts
- Archive Viewer
- PDF Viewer (file information/selection prototype, not a full PDF renderer)
- Calendar

### Data and account management

- Per-tenant/per-user browser storage for users, companies, requests,
  installations, pins, notes, and IDE files.
- Admin can assign users to Local or a registered company.
- Server login searches users belonging to the selected company.
- Company Registration can export a company's users as `.users.json`.
- `System/Users/example-company.users.json` documents the export shape.
- `System/Resources/DATA_STORAGE.md` documents the browser-storage model.

## Change log

### Work completed before 2026-07-15

- Renamed the large login branding from TERM to AntigravityOS and changed it to
  a more compact ASCII presentation.
- Added sudo app launching, elevated-window styling, `sudo su`, root-shell
  state, and `exit` from root.
- Added single-instance app behavior and open/elevated status indicators.
- Replaced the sidebar launcher with a taskbar/window model.
- Made Terminal the persistent default window.
- Removed the red/yellow/green window dots.
- Added logout confirmation.
- Converted the taskbar to icons and added a Start menu with reboot, shutdown,
  and logout actions.
- Expanded the prototype with local/company accounts, Admin tools, password and
  profile requests, Store apps, IDE storage, and exportable company-user data.

### 2026-07-15

- Added this `PROJECT_HANDOFF.md` file so development can continue on another
  computer or in another ChatGPT/Codex session.
- Added an automatic Admin account for every registered company. The username
  is `admin`, the email is generated as
  `admin@<company-name-slug>.antigravityos.svr`, and the initial password is
  `Admin123`. Existing registered companies are migrated on startup if their
  company-scoped Admin account is missing.
- Added an `InfinityFree` deployment folder. It contains a PHP + MySQL edition
  of AntigravityOS, including database synchronization, an installer, hosting
  configuration, and deployment instructions. The original edition remains
  browser-only.
- Added a confirmed **Remove** action to Company Registration. It deletes the
  company, all company users (including its default Admin), related password
  requests, and storage records scoped to that company's server address.
- Fixed company authentication: managed users had been written to the Local
  tenant scope while server login searched a server tenant scope. Managed users
  now use one central user collection and are filtered by `companyId` during
  login. Existing records in the legacy Local scope migrate automatically.
- Restricted **Company Registration** to the Local system Admin. Company Admins
  retain Admin tools for their own organization and can add users only to their
  currently connected company.
- Added **Company Info** for registered company Admins to request company name,
  ID, and domain changes. Added **Company Change Requests** exclusively for the
  Local/Master Admin to approve or reject those requests. Approvals cascade ID
  changes to company users and migrate domain-scoped application data.
- Replaced optional **Mail Drafts** with permanent built-in **Mail**. It cannot
  be uninstalled and supports internal delivery to registered users and Admins
  across companies, multiple recipients, Inbox/Sent views, replies, unread
  status, refresh, and Gmail-style account suggestions. It rejects addresses
  not present in the AntigravityOS user directory.
- Mail is permanently pinned to every account's taskbar and shows a numbered
  unread badge. Company/profile/password-reset decisions generate internal Mail
  notifications. Password resets are routed by role: company Admin requests go
  to the Master Admin, while company-user requests go to their company Admin.
  New profile/company/reset requests also send Mail alerts to the responsible
  reviewer.
- Added per-account Mail deletion. Removing mail hides it only from that
  account, so other senders/recipients retain their copies.
- Added **App Reset**, visible only to the Local/Master Admin. Opening it shows
  an irreversible confirmation. Confirmation wipes companies, company users,
  requests, mail, messages, installations, pins, notes, IDE/app data, and theme
  data while preserving the Master Admin, its local password override, and all
  managed Local accounts.
- App Reset explicitly preserves `antigravity-branding`; customized system name
  and version are not reset.
- Added a small `<System Name> <Version>` footer to setup, server selection,
  boot, and login screens; it is hidden on the desktop. Added the Master-Admin-
  only **Version Update** app, which persists a custom visible system name and
  version and applies them to current and newly rendered interface branding.
  Technical storage keys, `.antigravity.os` domains, and internal system email
  addresses intentionally remain unchanged.
- Fixed the terminal banner after branding updates: its border width and both
  text rows are now calculated and centered dynamically for any allowed system
  name/version length.

## Remaining work / limitations

These are known limitations, not promises that work has been scheduled:

- No real backend, database, email delivery, server connection, or secure
  authentication exists. “Server” behavior is simulated using local data.
- Credentials and managed-user passwords are plain text in JavaScript or
  `localStorage`; this must never protect real accounts or sensitive data.
- Browser `localStorage` does not automatically travel to another computer.
  Copying the project files transfers the code but not the browser's runtime
  accounts, notes, messages, installed apps, pins, or IDE documents.
- Runtime data cannot silently rewrite the project files. Company users must be
  explicitly exported where an export control is provided.
- The two `apps.js` copies differ. Only `System/Resources/apps.js` is active;
  the legacy `System/apps.js` should eventually be removed or synchronized.
- Some source text currently displays encoding artifacts such as `âš™`, `â–£`,
  or `Ã—` instead of the intended symbols. A future cleanup should normalize
  all project files to UTF-8 and verify every icon in the browser.
- Optional PDF and archive apps currently inspect selected file metadata; they
  do not fully render or extract those file formats.
- The UI still needs a complete browser regression pass at desktop and mobile
  sizes after future edits.
- No automated test suite is currently included.

## Important browser-storage keys

The exact keys are scoped in parts of the code, but the main families are:

- `antigravity-local-users`
- `antigravity-companies`
- `antigravity-password-reset-requests`
- `antigravity-profile-requests`
- `antigravity-profile-request-history`
- `antigravity-installed-apps:*`
- `antigravity-pinned-apps:*`
- `antigravity-ide-files:*`
- `antigravity-company-messages:*`
- `terminal-theme`

Resetting browser storage can erase runtime data. Preserve/export anything
important before testing reset features.

## Rules for the next editor

1. Read this file, `AntigravityOS.html`, and every active file under
   `System/Resources` before making structural changes.
2. Preserve the front-end-demo warning and never describe this authentication
   as secure.
3. Edit `System/Resources/apps.js`, not only `System/apps.js`, when changing the
   active optional app catalog.
4. Keep Terminal persistent and maintain the single-instance application model
   unless the user explicitly requests different behavior.
5. Do not erase existing `localStorage` data or change storage-key scoping
   without documenting the migration impact.
6. Validate JavaScript syntax and test boot, login, terminal commands, window
   controls, taskbar behavior, sudo/root behavior, logout, and changed apps.
7. Add every completed change to the change log below. Move resolved items out
   of **Remaining work / limitations** when appropriate.

## Change-log template for future work

Copy this block and place the newest dated entry above older entries:

```text
### YYYY-MM-DD

- Requested:
- Changed:
- Files modified:
- Tests performed:
- Known follow-up:
```
