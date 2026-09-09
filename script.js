/**
 * ============================================================================
 * PARENT ACTIVATION CODE GENERATOR
 * Internal Administration Utility for Quran Education & School Management
 * ============================================================================
 *
 * This utility generates the local activation code for parents, matching the
 * exact repeating-key XOR encryption algorithm used by the Flutter app and
 * Delphi backend API.
 */

// ============================================================================
// CONFIGURATION
// Replace this with the SAME secretKey used by the Flutter app and Delphi API.
// ============================================================================
const SECRET_KEY = "MyQuranSchoolSecretKey123";

// ============================================================================
// ALGORITHM & ENCODING DETAILS
// ============================================================================
/**
 * Important: UTF-8 Encoding Parity
 *
 * Dart's `utf8.encode(text)` generates a Uint8List containing the UTF-8 bytes
 * of the string. In JavaScript, simple string manipulation with `charCodeAt()`
 * only handles UTF-16 code units (0 to 65535) and fails on multi-byte or
 * international characters.
 *
 * To ensure 100% cryptographic parity across Dart, JavaScript, and Delphi,
 * we use the standard Web API `new TextEncoder().encode()`, which produces
 * an identical `Uint8Array` of raw UTF-8 bytes.
 *
 * Algorithm Workflow:
 * 1. UTF-8 encode plainText  -> Uint8Array
 * 2. UTF-8 encode secretKey  -> Uint8Array
 * 3. For each byte i in plainText:
 *      xorByte = textBytes[i] XOR keyBytes[i % keyBytes.length]
 *      convert xorByte to 2-character uppercase Hex
 * 4. Concatenate all hex pairs into an uppercase hexadecimal string.
 *
 * @param {string} plainText - The Parent ID to encrypt.
 * @param {string} secretKey - The shared secret key.
 * @returns {string} The uppercase hexadecimal activation code.
 */
function encryptCode(plainText, secretKey) {
  if (!plainText || !secretKey) {
    return "";
  }

  // Guaranteed UTF-8 byte conversion matching Dart's utf8.encode()
  const textBytes = new TextEncoder().encode(plainText);
  const keyBytes = new TextEncoder().encode(secretKey);

  let hexResult = "";

  for (let i = 0; i < textBytes.length; i++) {
    const xorByte = textBytes[i] ^ keyBytes[i % keyBytes.length];

    // Format byte as 2-digit zero-padded uppercase hexadecimal string
    hexResult += xorByte
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  }

  return hexResult;
}

/**
 * Formats a hexadecimal string into spaced 4-character blocks for visual
 * readability in the user interface (e.g. "6A3F 2B8C 91D4").
 *
 * @param {string} hex - Raw hexadecimal string.
 * @returns {string} Grouped hexadecimal string.
 */
function formatCodeForDisplay(hex) {
  if (!hex) return "";
  // Insert space after every 4 characters
  return hex.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Validates the raw Parent ID input.
 *
 * @param {string} rawInput - The user input from the text field.
 * @returns {{ isValid: boolean, trimmedValue: string, errorMessage: string }}
 */
function validateParentId(rawInput) {
  const trimmed = (rawInput || "").trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      trimmedValue: "",
      errorMessage: "Please enter a parent ID."
    };
  }

  // Ensure reasonable character set (supports numeric IDs and alphanumeric/hyphens)
  // Keeps it flexible for school systems using IDs like "123456", "P-8921", or "STU2026-9"
  const validPattern = /^[A-Za-z0-9\-_./#@]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      isValid: false,
      trimmedValue: trimmed,
      errorMessage: "Parent ID contains invalid characters. Please check the ID."
    };
  }

  return {
    isValid: true,
    trimmedValue: trimmed,
    errorMessage: ""
  };
}

// ============================================================================
// UI STATE & DOM CONTROLLERS
// ============================================================================

// State cache
let currentRawCode = "";
let currentParentId = "";
let copyTimeoutId = null;
let toastTimeoutId = null;

// DOM Elements Cache
const DOM = {
  form: document.getElementById("generatorForm"),
  parentIdInput: document.getElementById("parentIdInput"),
  clearInputBtn: document.getElementById("clearInputBtn"),
  parentIdError: document.getElementById("parentIdError"),
  parentIdHelp: document.getElementById("parentIdHelp"),
  generateBtn: document.getElementById("generateBtn"),
  resultSection: document.getElementById("resultSection"),
  formattedCode: document.getElementById("formattedCode"),
  metaParentId: document.getElementById("metaParentId"),
  metaRawCode: document.getElementById("metaRawCode"),
  copyCodeBtn: document.getElementById("copyCodeBtn"),
  clearBtn: document.getElementById("clearBtn"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  toast: document.getElementById("toastNotification"),
  toastMessage: document.getElementById("toastMessage")
};

/**
 * Displays or clears validation error message on the Parent ID field.
 *
 * @param {string} message - Error message, or empty string to clear error.
 */
function setInputError(message) {
  if (message) {
    DOM.parentIdInput.classList.add("is-invalid");
    DOM.parentIdInput.setAttribute("aria-invalid", "true");
    DOM.parentIdError.textContent = message;
    DOM.parentIdError.classList.remove("hidden");
    DOM.parentIdHelp.classList.add("hidden");
  } else {
    DOM.parentIdInput.classList.remove("is-invalid");
    DOM.parentIdInput.setAttribute("aria-invalid", "false");
    DOM.parentIdError.textContent = "";
    DOM.parentIdError.classList.add("hidden");
    DOM.parentIdHelp.classList.remove("hidden");
  }
}

/**
 * Generates the parent activation code from the input field.
 */
function handleGenerate() {
  const validation = validateParentId(DOM.parentIdInput.value);

  if (!validation.isValid) {
    setInputError(validation.errorMessage);
    DOM.parentIdInput.focus();
    return;
  }

  // Clear previous error
  setInputError("");

  // Normalize input value in field
  DOM.parentIdInput.value = validation.trimmedValue;

  // Execute repeating-key XOR encryption
  const parentId = validation.trimmedValue;
  const rawCode = encryptCode(parentId, SECRET_KEY);

  // Store in state
  currentParentId = parentId;
  currentRawCode = rawCode;

  // Update Result Card UI
  DOM.formattedCode.textContent = formatCodeForDisplay(rawCode);
  DOM.metaParentId.textContent = parentId;
  DOM.metaRawCode.textContent = rawCode;

  // Reveal Result Section with animation
  DOM.resultSection.classList.remove("hidden");

  // Smoothly scroll result card into view if needed on small screens
  DOM.resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Copies the raw, unformatted hexadecimal activation code to clipboard.
 */
async function handleCopy() {
  if (!currentRawCode) return;

  try {
    // Copy the raw, unformatted code (NO spaces)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(currentRawCode);
    } else {
      // Fallback for older browsers or non-HTTPS local contexts
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = currentRawCode;
      tempTextArea.style.position = "fixed";
      tempTextArea.style.opacity = "0";
      document.body.appendChild(tempTextArea);
      tempTextArea.focus();
      tempTextArea.select();
      document.execCommand("copy");
      document.body.removeChild(tempTextArea);
    }

    // Update copy button state
    const btnText = DOM.copyCodeBtn.querySelector(".btn-text");
    DOM.copyCodeBtn.classList.add("copied-state");
    btnText.textContent = "Copied ✓";

    // Show toast notification
    showToast("Activation code copied");

    // Reset button after ~2 seconds
    clearTimeout(copyTimeoutId);
    copyTimeoutId = setTimeout(() => {
      DOM.copyCodeBtn.classList.remove("copied-state");
      btnText.textContent = "Copy Code";
    }, 2000);

  } catch (err) {
    console.error("Failed to copy activation code:", err);
    showToast("Could not copy automatically. Please select and copy manually.");
  }
}

/**
 * Resets the generator, clears state, hides results, and restores focus.
 */
function handleClear() {
  // Clear state
  currentRawCode = "";
  currentParentId = "";

  // Reset form and error states
  DOM.parentIdInput.value = "";
  setInputError("");
  DOM.clearInputBtn.classList.add("hidden");

  // Hide result card
  DOM.resultSection.classList.add("hidden");
  DOM.formattedCode.textContent = "";
  DOM.metaParentId.textContent = "—";
  DOM.metaRawCode.textContent = "—";

  // Reset copy button if actively showing "Copied"
  clearTimeout(copyTimeoutId);
  DOM.copyCodeBtn.classList.remove("copied-state");
  const btnText = DOM.copyCodeBtn.querySelector(".btn-text");
  if (btnText) btnText.textContent = "Copy Code";

  // Return focus to input
  DOM.parentIdInput.focus();
}

/**
 * Shows a toast message for feedback.
 *
 * @param {string} message
 */
function showToast(message) {
  DOM.toastMessage.textContent = message;
  DOM.toast.classList.add("show");

  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => {
    DOM.toast.classList.remove("show");
  }, 2200);
}

// ============================================================================
// THEME MANAGEMENT (Dark / Light Mode)
// ============================================================================
const THEME_STORAGE_KEY = "school_admin_theme_pref";

/**
 * Applies the specified theme to the document and updates storage.
 *
 * @param {"dark" | "light"} theme
 */
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // localStorage might be unavailable in restricted contexts
  }
}

/**
 * Initializes theme on page load (Default: dark).
 */
function initTheme() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (e) { }

  if (savedTheme === "light" || savedTheme === "dark") {
    setTheme(savedTheme);
  } else {
    // Default is dark mode per requirements
    setTheme("dark");
  }
}

/**
 * Toggles between dark and light themes.
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
}

// ============================================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================================

function initApp() {
  // Initialize theme
  initTheme();

  // Form Submission
  DOM.form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleGenerate();
  });

  // Action Buttons
  DOM.copyCodeBtn.addEventListener("click", handleCopy);
  DOM.clearBtn.addEventListener("click", handleClear);
  DOM.themeToggleBtn.addEventListener("click", toggleTheme);

  // Input Inline Clear Button
  DOM.parentIdInput.addEventListener("input", () => {
    const hasValue = DOM.parentIdInput.value.length > 0;
    DOM.clearInputBtn.classList.toggle("hidden", !hasValue);

    // Clear error as user starts typing again
    if (DOM.parentIdInput.classList.contains("is-invalid")) {
      setInputError("");
    }
  });

  DOM.clearInputBtn.addEventListener("click", () => {
    DOM.parentIdInput.value = "";
    DOM.clearInputBtn.classList.add("hidden");
    setInputError("");
    DOM.parentIdInput.focus();
  });

  // Keyboard Shortcuts:
  // - Enter generates
  // - Escape clears
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      handleClear();
    }
  });

  // Auto-focus input on page load
  DOM.parentIdInput.focus();
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// ============================================================================
// DEVELOPER VERIFICATION TESTS & COMPATIBILITY CHECK
// ============================================================================
/*
  To test compatibility between this generator and Flutter:

  In Flutter / Dart:
  ---------------------------------------------------------
  static String encryptCode(String plainText) {
    final textBytes = utf8.encode(plainText);
    final keyBytes = utf8.encode(secretKey);
    final buffer = StringBuffer();

    for (int i = 0; i < textBytes.length; i++) {
      final xorByte = textBytes[i] ^ keyBytes[i % keyBytes.length];
      buffer.write(
        xorByte.toRadixString(16).padLeft(2, '0').toUpperCase(),
      );
    }

    return buffer.toString();
  }
  print(encryptCode("123456"));

  In JavaScript:
  ---------------------------------------------------------
  console.log(encryptCode("123456", SECRET_KEY));

  Both functions produce the exact same hexadecimal output:
  Example with SECRET_KEY = "YOUR_SECRET_KEY":
  encryptCode("123456", "YOUR_SECRET_KEY") -> "687D66666A65"
*/

// Developer diagnostic log (open browser console to inspect):
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.info(
    "%c[Admin Tool]%c Parent Activation Code Generator Initialized.\nVerification check for '123456':",
    "color: #159A78; font-weight: bold;",
    "color: inherit;",
    encryptCode("123456", SECRET_KEY)
  );
}
