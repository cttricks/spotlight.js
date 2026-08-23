# Contribution Guide

Welcome to Spotlight JS! As an open-source project, we value all kinds of contributions—from bug reports and documentation updates to new features and architectural improvements.

## Development Setup

1. **Clone the Repo**
   ```bash
   git clone https://github.com/cttricks/spotlight.js.git
   cd spotlight.js
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build Core Files**
   This project uses TypeScript and produces output in `dist/`.
   ```bash
   npm run build
   ```

## Workflow

1. **Fork** the repository and create your feature branch: `git checkout -b feature/awesome-thing`.
2. **Commit** your changes following meaningful commit messages.
3. **Verify** your changes by running the local example in `/example`.
4. **Push** to your fork and submit a **Pull Request**.

## Roadmap & Potential Improvements

- [ ] Add support for custom CSS class hooks on popovers.
- [ ] Implement auto-scroll detection during browser resize.
- [ ] Add keyboard navigation (Esc to exit, Arrow keys for steps).
- [ ] Extend event callbacks for more granular integration.
- [ ] Improve mobile responsiveness for small screens.

## Security & Issues

If you find a bug or have a security concern, please open an Issue on GitHub with:
- Detailed description of the problem.
- Steps to reproduce.
- Browser/OS environment details.

---

Thank you for helping make Spotlight JS a mature library for everyone!
Licensed under **MIT**.
