import { renderNavigation, contentNavigation } from "./nav-utils.js";

export async function initNavigation() {
  console.log("# Loading Navigation Service...");
  try {
    renderNavigation();
    contentNavigation();
  } catch (err) {
    console.error("Error loading ribbon:", err);
  }
}