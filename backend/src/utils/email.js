function isValidEmailFormat(email) {
  // Simple RFC-ish check; for production consider a robust validator.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function emailMatchesAllowedDomains(email, allowedDomains) {
  if (!allowedDomains || allowedDomains.length === 0) return true; // optional validation
  const value = String(email || '').trim().toLowerCase();
  return allowedDomains.some((domain) => value.endsWith(`@${domain}`));
}

module.exports = { isValidEmailFormat, emailMatchesAllowedDomains };

