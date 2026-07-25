export async function initFooter() {
  console.log("# Loading Footer Service...");
  try {
    const parent = document.body;
    const footer = document.createElement("footer");

    footer.className = "global-subtext";
    footer.innerHTML = "©2026. All rights reserved.";

    parent.appendChild(footer);
  } catch (err) {
    console.error("Error loading footer:", err);
  }
}
