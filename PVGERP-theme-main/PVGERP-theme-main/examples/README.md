# Examples

Ready-to-run HTML pages demonstrating how to use the ERP theme across different modules. Each example is self-contained and uses the PVG college config — swap `colleges/pvg/config.css` for any other college to instantly rebrand.

## Pages

| File | Module | Description |
|------|--------|-------------|
| [`01-login.html`](01-login.html) | Auth | Full login page — role selector (student / faculty / admin), password toggle, SSO & OTP buttons, form validation |
| [`02-dashboard.html`](02-dashboard.html) | Core | Main dashboard — stat cards, enrolment chart, department progress bars, mini calendar, recent admissions table, activity log |
| [`03-admission-form.html`](03-admission-form.html) | Admission | Multi-step wizard — personal info, academic details, document upload, review & submit with success state |
| [`04-notifications.html`](04-notifications.html) | Notifications | Notification centre — filter tabs, unread/read state, compose modal, mark-all-read, real-time badge update |

## How to run

Start a local server from the **project root** (not the examples folder):

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .
```

Then open:

```
http://localhost:8080/examples/01-login.html
http://localhost:8080/examples/02-dashboard.html
http://localhost:8080/examples/03-admission-form.html
http://localhost:8080/examples/04-notifications.html
```

> Opening HTML files with `file://` URLs will block font and CSS imports — always use a local server.

## Using this in your own module

Every example follows the same three-line include pattern:

```html
<!-- 1. FontAwesome icons (or use your own icon set) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

<!-- 2. Generic theme (host this on your CDN) -->
<link rel="stylesheet" href="path/to/erp-theme.css" />

<!-- 3. College-specific branding (one file per college) -->
<link rel="stylesheet" href="path/to/colleges/pvg/config.css" />
```

And at the end of `<body>`:

```html
<script src="path/to/erp-theme.js"></script>
```

### Pages with a sidebar + topbar

Copy this layout shell and fill in the `<main>` content:

```html
<aside class="erp-sidebar">
  <div class="erp-sidebar__brand">
    <img class="erp-sidebar__logo" src="colleges/<slug>/assets/icon-180.jpg" alt="Logo" />
    <div class="erp-sidebar__brand-text">
      <h2>College Short Name</h2>
      <span>Module Name</span>
    </div>
  </div>

  <nav class="erp-sidebar__nav">
    <div class="erp-nav-label">Section</div>
    <a class="erp-nav-item erp-nav-item--active" href="#">
      <i class="fa-solid fa-gauge-high"></i>
      <span class="erp-nav-item__text">Dashboard</span>
    </a>
    <!-- more nav items -->
  </nav>

  <div class="erp-sidebar__footer">
    <div class="erp-avatar erp-avatar--md">AB</div>
    <div class="erp-sidebar__user-info"><p>User Name</p><span>Role</span></div>
    <i class="fa-solid fa-right-from-bracket erp-sidebar__logout"></i>
  </div>
</aside>

<header class="erp-topbar">
  <button class="erp-topbar__btn" data-erp-sidebar-toggle>
    <i class="fa-solid fa-bars"></i>
  </button>
  <nav class="erp-topbar__breadcrumb" data-erp-breadcrumb></nav>
  <!-- search, actions, profile -->
</header>

<main class="erp-main" data-erp-page="Section / Page Title">
  <!-- page content -->
</main>
```

### Pages without a sidebar (auth / login)

```html
<div class="erp-auth-page">
  <div class="erp-auth-page__brand">
    <!-- Logo, college name, tagline -->
  </div>
  <div class="erp-auth-page__form">
    <div class="erp-auth-box">
      <!-- Login / register form -->
    </div>
  </div>
</div>
```

## JavaScript API quick reference

```javascript
// Toast notifications
ERP.Toast.show('Message', 'success' | 'error' | 'warning' | 'info');

// Modal
ERP.Modal.open('modalId');
ERP.Modal.close('modalId');

// Confirmation dialog
ERP.Confirm.show({ title, message, onConfirm, onCancel });

// Page loader
ERP.Loader.show();
ERP.Loader.hide();

// Form validation (uses HTML5 required attributes)
ERP.Form.validate(formElement); // returns true/false

// Table sort (auto-applied when data-erp-sortable on <table>)
// Breadcrumb (auto-built from data-erp-page="Section / Page")
// Sidebar toggle (auto-wired to data-erp-sidebar-toggle)
```
