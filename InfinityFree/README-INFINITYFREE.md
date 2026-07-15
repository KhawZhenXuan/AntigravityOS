# AntigravityOS on InfinityFree

This folder is the website root. Upload its **contents** into the InfinityFree
`htdocs` directory.

## 1. Create the database

In the InfinityFree control panel, create a MySQL database and record its:

- MySQL host name
- Database name
- Username
- Password

The host name shown by InfinityFree is normally required; do not assume it is
`localhost`.

## 2. Configure the website

Open `config.php` and replace all `YOUR_MYSQL_*` placeholders. Also replace
`CHANGE-THIS-INSTALL-KEY` with a long value known only to you.

## 3. Upload and install

Upload all files and folders here into `htdocs`, preserving the directory
structure. Visit:

```text
https://YOUR-SITE/install.php?key=YOUR-INSTALL-KEY
```

After installation succeeds, delete or rename `install.php` through the file
manager or FTP.

Test the API at:

```text
https://YOUR-SITE/api.php?action=health
```

It should return JSON containing `"ok":true`.

## 4. Open AntigravityOS

Visit the domain normally. `index.html` is the application. Its supported
browser-storage records are loaded from MySQL at startup and changes are sent
back to MySQL automatically.

Company registration, users, profile requests, password-reset requests,
messages, installations, pins, notes, and other AntigravityOS simulation data
therefore persist centrally instead of existing only in one visitor's browser.

## Important simulation limitations

- This is a simulation, not production authentication.
- Passwords are readable because that was requested for the simulation.
- The synchronization API stores the current browser data values centrally.
- Simultaneous edits to the exact same record can use last-write-wins behavior.
- Keep database backups. Free hosting may not provide backups for you.
- `config.php` contains the database password. The included `.htaccess` blocks
  web access to it, and PHP normally does not reveal its source, but never share
  that file publicly.

