# Company user files

`example-company.users.json` demonstrates the per-company export format.

In AntigravityOS, Admin assigns each managed user to either **Local** or a
registered company in the **Add User** app. Server login only searches users
assigned to the selected registered company.

Open **Company Registration** and click **Export Users** beside a company to
download that company's current users as a separate `.users.json` file.

Browsers cannot silently create or update disk files, so runtime user records
remain in `localStorage` until Admin explicitly exports them. Passwords are
plain text only because this is a front-end demo; production systems must store
salted password hashes on a backend server.
