export function maskSecretValues(text: string, secretNames: string[]) {
  let regexp: RegExp;
  let safeText = text;
  for (const secretName of secretNames) {
    regexp = new RegExp(
      `("?${secretName}"?\\s*[=:]\\s*"?)([^"^&.]+)(["&]?.*)`,
      "gi"
    );
    safeText = safeText.replace(regexp, "$1###$3");
  }
  return safeText;
}
