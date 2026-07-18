# Scope

Applies to admin frontend pages and page-specific admin behavior in this folder.

# UI Direction

- Clarity and speed over cinematic effects.
- Subtle motion only.
- Responsive SaaS layout.
- Accessible forms.
- Desktop tables convert to mobile cards.

# Data Rules

- Use `portfolioRepository`.
- Do not access `localStorage` directly from page components.
- Public and admin use the same data.
- Local uploads are not permanent.

# CRUD Requirements

Each CRUD module must include:

- loading state
- empty state
- error state
- validation
- search or filter where relevant
- confirmation before destructive action
- success/error feedback
- keyboard focus handling
- mobile layout

# Security Wording

Do not imply frontend demo authentication is production security.

# Validation

Use:

- [../../../../docs/ADMIN_CMS.md](../../../../docs/ADMIN_CMS.md)
- [../../../../docs/DATA_MODELS.md](../../../../docs/DATA_MODELS.md)
- [../../../../docs/TESTING_CHECKLIST.md](../../../../docs/TESTING_CHECKLIST.md)
