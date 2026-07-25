// static/js/ribbon-service/ribbon.js
import { renderRibbon, toggleTheme, bgAudio, helpCenter } from "./ribbon-utils.js";

export async function initHeaderRibbon() {
  console.log("# Loading Ribbon Service...");
  try {
    const ribbon = renderRibbon();
    document.body.appendChild(ribbon);
    toggleTheme();
    bgAudio();
    helpCenter()
  } catch (err) {
    console.error("Error loading ribbon:", err);
  }
}
