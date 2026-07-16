# AntigravityOS Project Handoff

Last reviewed: 2026-07-15

## InfinityFree edition

This copy is the PHP + MySQL edition prepared for InfinityFree hosting. Its web
entry point is `index.html`. `api.php` synchronizes the application's supported
storage records with MySQL, `config.php` contains the hosting credentials, and
`install.php` creates the database table. Follow `README-INFINITYFREE.md` before
uploading. The original browser-only edition remains outside this folder.

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
- Boot duration scales with installed apps but is capped at 8 seconds.

### Desktop and windows

- Desktop-style interface with a bottom icon taskbar.
- Start button and Start menu with reboot, shutdown, and logout actions.
- Apps launcher.
- Terminal opens automatically as the default window after login.
- Terminal cannot be closed; it can be moved, minimized, maximized/restored,
  and resized.
- Application windows are draggable, resizable, minimizable, maximizable, and
  focusable.
- Maximized application windows fill the complete desktop application layer;
  restoring returns them to their previous window dimensions.
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
- Mail (permanent, pinned internal mail with inbox, sent mail, compose, replies,
  deletion, cross-company delivery, autocomplete, and unread badges)
- Gravity Web with search/address navigation, multiple tabs, back/reload, an
  embedded page view, and external-browser fallback.
- Antigravity IDE with virtual files, import, export, save, rename, and new file
- Antigravity Store for optional application installation/uninstallation
- Files
- System information
- Settings, including theme, data reset, app management, and taskbar pins
- App Reset (Local/Master Admin only; preserves branding and Local accounts)
- Version Update (Local/Master Admin only)
- Add User (Admin; company Admins are restricted to their company)
- Profile and password management
- Profile Change Requests (Admin)
- Company Info (company Admin only)
- Company Registration and company-user export (Local/Master Admin only)
- Company Change Requests (Local/Master Admin only)
- Password Reset Requests (routed to the responsible Admin)
- Company contacts/messaging support is implemented in the main HTML renderer.

### Optional/store applications in the active catalog

- Audio Player
- Video Player
- Docs
- Sheets
- Slides
- Gravity Chat (directory-based internal messaging with unread badges)
- Archive Viewer
- PDF Viewer (file information/selection prototype, not a full PDF renderer)
- Calendar

Slides presentation mode is read-only and supports Left/Right, Page Up/Page
Down, Home/End, and Space keyboard navigation while fullscreen. The Store uses
a fixed title/description header and a separately scrolling app list; its app
detail Back control remains fixed above the scrolling detail content.

### Data and account management

- MySQL-synchronized browser storage for users, companies, requests, Mail,
  branding, installations, pins, notes, and IDE files.
- Admin can assign users to Local or a registered company.
- Server login searches users belonging to the selected company.
- Company Registration can export a company's users as `.users.json`.
- `System/Users/example-company.users.json` documents the export shape.
- `System/Resources/DATA_STORAGE.md` documents the browser-storage model.

## Change log

### 2026-07-16

- Improved Settings theme selectors and renamed the visible Dark theme to
  **Midnight**. Theme choices now display only Night, Midnight, and Light.
- Redesigned Light theme surfaces, contrast, inputs, window chrome, and shadows.
- Added synchronized per-user accent-color storage and a Settings control
  beneath Themes.
- Kept the taskbar visible while Apps is open. Apps now toggles closed when its
  button is pressed again, and any taskbar app click closes the Apps overlay.
- Added built-in **Gravity Web** with URL/search input, tabs, back, reload,
  embedded browsing, and an external-browser fallback for sites that block
  iframes.
- Added safe URL detection in Mail and Gravity Chat. Normal link clicks open
  Gravity Web; Ctrl/Cmd-click opens the regular browser in a new tab.
- Files modified: `index.html`, `System/Resources/apps.js`, and both handoff
  files. Matching changes were applied to the browser-only edition.
- Tests performed: Both HTML entry points and both active app catalogs passed
  JavaScript syntax validation and catalog parity checks.
- Known follow-up: Embedded site compatibility depends on each website's frame
  policy; full interactive browser regression testing remains required.

- Capped boot waits at 8 seconds and made maximized app windows fill the entire
  desktop application layer with edge-to-edge sizing and no resize handle.
- Added Gravity Chat email autocomplete using the shared account directory.
- Added Docs page-size selection for A4, Letter, Legal, A5, and Executive;
  added explicit Ctrl/Cmd+Z, Ctrl/Cmd+Y, and Ctrl/Cmd+Shift+Z handling.
- Added Sheets gridlines on every cell, Excel-style all/none/top/bottom/left/
  right border controls, undo/redo buttons and shortcuts, and a labeled,
  full-size Fill color control.
- Added Slides undo/redo history, buttons and keyboard shortcuts, and changed
  the small color input into a labeled Background control.
- Files modified: `index.html`, `System/Resources/apps.js`, and both handoff
  files. Matching changes were applied to the browser-only edition.
- Tests performed: Both HTML entry points and both active app catalogs passed
  JavaScript syntax validation; catalog files are synchronized.
- Known follow-up: Interactive browser regression testing is still required.

- Upgraded Docs with document styles, font sizing, alignment, lists, colors,
  undo/redo, word counts, saving, HTML export, and printing.
- Upgraded Sheets to a 30-row by 12-column workbook with cell selection,
  formula bar, arithmetic/cell references, SUM/AVERAGE/MIN/MAX ranges, bold and
  fill formatting, saving, clearing, and CSV export.
- Expanded Slides with duplication, reordering, background colors, saving,
  fullscreen read-only presentation, keyboard navigation, and slide counts.
- Renamed Contacts to **Gravity Chat**. It uses the Mail account directory,
  adds contacts by registered email, stores synchronized conversations,
  displays signed-in username/company, marks opened messages read, and supplies
  taskbar unread counts. The previous server-only Contacts renderer is no
  longer substituted.
- Upgraded Calendar with month navigation and persistent events, tasks, and
  reminders. Added runtime account/directory hooks for optional apps.
- Files modified: `index.html`, `System/Resources/apps.js`,
  `System/Resources/DATA_STORAGE.md`, and both handoff files. Matching changes
  were applied to the browser-only edition.
- Tests performed: All active JavaScript and both HTML entry-point scripts
  passed syntax checks; the two active app catalogs are synchronized.
- Known follow-up: Full interactive browser testing remains required.

- Requested: Fix keyboard navigation and editing in fullscreen Slides, keep the
  Antigravity Store heading visible while its catalog scrolls, and keep a
  shorter **Back** control visible on app detail pages.
- Changed: Slides now enters a read-only presentation state with previous/next
  keyboard controls and a slide counter. Store catalog and detail screens now
  use fixed headers with independently scrolling content.
- Files modified: `index.html`, `System/Resources/apps.js`, and both project
  handoff files. Equivalent changes were made in the browser-only edition.
- Tests performed: JavaScript syntax and browser/InfinityFree source parity
  were checked. Interactive browser testing was attempted but the local browser
  connection was blocked by a filesystem permission error.
- Known follow-up: Verify fullscreen keyboard navigation and Store scrolling in
  a browser on desktop and mobile layouts.

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
- Created the `InfinityFree` distribution with an InfinityFree-compatible PHP
  8.3 API, MySQL persistence table, installer, protected configuration file,
  deployment guide, and a browser-to-database synchronization bridge. Node.js
  and SQLite were not used because the target free hosting supports PHP and
  MySQL/MariaDB rather than Node.js.
- Added a confirmed **Remove** action to Company Registration. It deletes the
  company, all company users (including its default Admin), related password
  requests, and company-scoped data. In this edition, those removals synchronize
  to MySQL through `api.php`.
- Fixed company Admin login by moving managed users to a central synchronized
  collection and filtering them by `companyId` during authentication. Existing
  records from the previous Local-scoped key migrate automatically and sync to
  MySQL.
- Restricted **Company Registration** to the Local system Admin. Company Admins
  retain their organization-management tools, and Add User is locked to the
  company in the current server session.
- Added **Company Info** for company Admin change requests and **Company Change
  Requests** for Local/Master Admin approval. Approved company ID changes update
  linked users; approved domain changes migrate scoped browser/MySQL records.
- Replaced optional **Mail Drafts** with permanent built-in **Mail**. Internal
  messages synchronize through MySQL and support cross-company users/Admins,
  multiple recipients, Inbox/Sent views, replies, unread state, refresh, and
  Gmail-style directory suggestions. Unknown external addresses are rejected.
- Mail is forced into every account's taskbar pins and displays an unread-count
  badge. Company, profile, and password-reset outcomes generate system mail.
  Company Admin password resets route to the Master Admin; ordinary company
  users route to their own company Admin. Reviewer alerts and decisions sync
  through MySQL with the rest of the Mail data.
- Added per-account Mail deletion and the Master-Admin-only **App Reset** app.
  Reset requires confirmation and synchronizes removal of all company and app
  data to MySQL while preserving the Master Admin/password override and every
  managed Local account.
- App Reset preserves the synchronized `antigravity-branding` record, so the
  configured system name and version remain unchanged.
- Added a pre-desktop system-name/version footer and the Master-Admin-only
  **Version Update** app. Branding is stored under `antigravity-branding`, syncs
  through MySQL, updates newly rendered UI through a DOM observer, and avoids
  changing technical domains, internal email addresses, or storage keys.
- Replaced fixed terminal-banner spacing with dynamic width and centering so
  branding changes such as `v1.2` cannot misalign the box borders.

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
