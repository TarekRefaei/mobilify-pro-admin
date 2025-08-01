# Contributing to Mobilify Pro

Thank you for your interest in contributing to Mobilify Pro! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Git
- Firebase account (for testing)

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/mobilify-pro-admin.git`
3. Install dependencies: `npm install`
4. Create a `.env` file with your Firebase configuration
5. Start development server: `npm run dev`

## 📋 Development Workflow

### Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/issue-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `docs/documentation-update` - Documentation changes

### Commit Message Format
We follow conventional commits:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
- `feat(orders): add real-time order notifications`
- `fix(auth): resolve login redirect issue`
- `docs(readme): update installation instructions`

## 🧪 Testing Requirements

### Before Submitting a PR
1. **Run all tests:** `npm test`
2. **Check TypeScript:** `npm run type-check`
3. **Lint code:** `npm run lint`
4. **Test build:** `npm run build`

### Test Coverage
- Maintain >80% test coverage for new code
- Write unit tests for components and utilities
- Add integration tests for complex features
- Include E2E tests for critical user flows

## 📝 Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces for all data structures
- Avoid `any` type - use proper typing
- Use meaningful variable and function names

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices for performance
- Use proper prop types and default values

### Styling
- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use semantic HTML elements

## 🔍 Code Review Process

### Pull Request Guidelines
1. **Clear Description:** Explain what changes were made and why
2. **Link Issues:** Reference related issues using `Fixes #123`
3. **Screenshots:** Include screenshots for UI changes
4. **Testing:** Describe how the changes were tested
5. **Breaking Changes:** Clearly document any breaking changes

### Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Performance impact considered
- [ ] Security implications reviewed

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues to avoid duplicates
2. Test with the latest version
3. Reproduce the issue consistently

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js version: [e.g. 18.0.0]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

## 📚 Documentation

### Documentation Standards
- Keep README.md up to date
- Document all public APIs
- Include code examples
- Update CHANGELOG.md for releases

### JSDoc Comments
```typescript
/**
 * Calculates the total price for an order
 * @param items - Array of order items
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns Total price including tax
 */
function calculateTotal(items: OrderItem[], taxRate: number): number {
  // Implementation
}
```

## 🚀 Release Process

### Version Numbering
We follow Semantic Versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Release notes prepared

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on what's best for the community

### Getting Help
- Check existing documentation first
- Search existing issues
- Ask questions in discussions
- Be specific about your problem

## 📞 Contact

- **Issues:** Use GitHub Issues for bugs and feature requests
- **Discussions:** Use GitHub Discussions for questions and ideas
- **Security:** Report security issues privately via email

Thank you for contributing to Mobilify Pro! 🍽️
