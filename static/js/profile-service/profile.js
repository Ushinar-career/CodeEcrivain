import { renderProfile, enableProfilePhotoPopup } from "./profile-utils.js";

export async function initProfileSection() {
  console.log("# Loading Profile Service...");
  try {
    renderProfile();
    enableProfilePhotoPopup();
  } catch (err) {
    console.error("Error loading ribbon:", err);
  }
}


