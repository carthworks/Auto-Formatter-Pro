# Privacy Policy for Auto Formatter Pro

**Last Updated:** December 11, 2025

## Overview

Auto Formatter Pro is committed to protecting your privacy. This extension operates entirely on your local device and does not collect, store, or transmit any personal data to external servers.

## Data Collection

**We do NOT collect:**
- Personal information
- Usage statistics
- Analytics data
- Browsing history
- Formatted code or text
- Any user data whatsoever

## Local Storage

The extension uses Chrome's local storage API exclusively for:

1. **User Preferences**
   - Theme selection (light/dark)
   - Indentation settings
   - Default view mode
   - Context menu enable/disable state

2. **Format History**
   - Last 5 formatted outputs
   - Stored locally on your device only
   - Never transmitted externally

3. **GitHub Token** (Optional)
   - Only if you choose to use GitHub Gist integration
   - Stored locally in encrypted Chrome storage
   - Never transmitted to our servers
   - Only sent to GitHub API when you create a Gist

## Permissions Explained

### Required Permissions

**storage**
- **Purpose:** Save user preferences and format history locally
- **Data:** Settings and last 5 formatted outputs
- **Location:** Local device only

**contextMenus**
- **Purpose:** Add "Format Selection" to right-click menu
- **Data:** Selected text (processed locally, not stored)
- **Location:** Local processing only

**downloads**
- **Purpose:** Export formatted code as files
- **Data:** Formatted output (stays on your device)
- **Location:** Downloads to your device

### Optional Permissions

**host_permissions (api.github.com)**
- **Purpose:** Create GitHub Gists (optional feature)
- **Data:** Only code you choose to share
- **Location:** Sent to GitHub only when you click "Share to Gist"
- **Note:** Requires your GitHub token, which you provide voluntarily

## Third-Party Services

The extension may interact with third-party services **only when you explicitly initiate the action**:

### GitHub API
- **When:** Only when you click "Share to GitHub Gist"
- **What:** Your formatted code and GitHub token
- **Why:** To create a public Gist on your behalf
- **Control:** You provide the token; you can revoke it anytime

### Gmail
- **When:** Only when you click "Share to Gmail"
- **What:** Opens mailto: link with formatted code
- **Why:** To compose an email in your default email client
- **Control:** You control what gets sent

### Slack
- **When:** Only when you click "Share to Slack"
- **What:** Opens Slack web interface, copies code to clipboard
- **Why:** To help you share code in Slack
- **Control:** You paste and send manually

## Data Security

- All processing happens **locally in your browser**
- No data is sent to external servers (except GitHub when you explicitly share)
- No cookies are used
- No tracking scripts
- No analytics
- No advertisements

## Children's Privacy

This extension does not knowingly collect information from children under 13. The extension is designed for developers and does not target children.

## Changes to Privacy Policy

We may update this privacy policy from time to time. Changes will be:
- Posted on this page
- Reflected in the "Last Updated" date
- Announced in extension updates (if significant)

## Your Rights

You have the right to:
- Clear all locally stored data (via Chrome settings)
- Disable the extension at any time
- Remove the extension completely
- Revoke GitHub token access

## How to Clear Your Data

1. **Clear History:**
   - Open the extension
   - History is automatically limited to 5 items
   - Reinstalling the extension clears all data

2. **Clear Settings:**
   - Go to Settings
   - Click "Reset to Defaults"
   - Or uninstall the extension

3. **Revoke GitHub Access:**
   - Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
   - Delete the token you created for this extension

## Open Source

This extension is open source. You can:
- Review the source code
- Verify our privacy claims
- Contribute improvements
- Report security issues

## Contact

For privacy-related questions or concerns:

- **GitHub Issues:** [Create an issue](https://github.com/[your-username]/auto-formatter-pro/issues)
- **Email:** [your-email@example.com]

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)

## Consent

By installing and using Auto Formatter Pro, you consent to this privacy policy.

---

**Summary:** Auto Formatter Pro respects your privacy. We don't collect your data, we don't track you, and we don't send your code anywhere (unless you explicitly choose to share it).
