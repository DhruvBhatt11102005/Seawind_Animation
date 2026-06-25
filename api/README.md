# Form email setup

Contact, homepage CTA, and careers forms post to `send-mail.php`.

## Option A — PHP hosting (recommended for seawindsolution.com)

1. Copy `config.sample.php` to `config.php`
2. Set `to_email` to your inbox (e.g. `info@seawindsolution.com`)
3. Set `from_email` to an address on your domain (required by many hosts)
4. Upload the full site including the `api/` folder
5. Ensure PHP `mail()` works, or configure SMTP with your host

## Option B — Web3Forms (static hosting / no PHP)

1. Create a free account at [https://web3forms.com](https://web3forms.com)
2. Open `forms-config.js` in the site root
3. Set `web3formsKey` to your access key
4. Forms will send via Web3Forms; PHP is skipped when the key is set

## Option C — Fallback

If both fail, the browser opens a `mailto:` link to `info@seawindsolution.com` with the form contents.

## Local testing

Run PHP built-in server from the project root:

```bash
php -S localhost:8080
```

Open `http://localhost:8080/contact.html` and submit the form.
