// ==============================
// Profile Renderer
// ==============================
export function renderProfile() {
  const parent = document.querySelector(".code-ecrivain")
  const wrapper = document.createElement("section");
  wrapper.className = "profile-container"

  wrapper.innerHTML = `
      <img class="profile-container-display-photo" title="Click to view photo"
        src="static/assets/images/profile_picture_lq.png" alt="">
      <div class="profile-container-info-section">
        <h1 class="global-title name" title="Name">
          Ushinar Chatterjee
        </h1>
        <h2 class="global-text-md role" title="Business-Sector">
          Software Solutions — IT
        </h2>
        <div class="profile-container-exp-section">
          <p class="global-text-md exp" title="Experience">
            10+ years
          </p>
          <a class="material-icons download-icon" href="" target="_blank" title="Download Resume">
            download_for_offline
          </a>
        </div>
      </div>
  `;

  parent.appendChild(wrapper);
}

// ==============================
// Profile Photo Pop-up
// ==============================
export function enableProfilePhotoPopup() {
  const parent = document.querySelector(".code-ecrivain")
  const photo = document.querySelector(".profile-container-display-photo");
  const popup = document.createElement("div");
  popup.className = "profile-photo-popup hidden";

  popup.innerHTML = `
    <div class="profile-photo-popup-content">
      <img class="popup-photo" src="static/assets/images/profile_picture_lq.png" alt="Profile Photo">
    </div>
    <span class="material-icons profile-photo-popup-close-icon" title="Close">
      close
    </span>
  `;

  parent.appendChild(popup);

  const popupPhoto = popup.querySelector(".popup-photo");

  const hqImage = new Image();
  hqImage.src = "static/assets/images/profile_picture_hq.png";
  hqImage.onload = () => {
    popupPhoto.src = hqImage.src;
    photo.src = hqImage.src;
  };

  photo.addEventListener("click", () => {
    popup.classList.remove("hidden");
  });

  const closeIcon = popup.querySelector(".profile-photo-popup-close-icon");
  closeIcon.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  popup.addEventListener("click", (event) => {
    const content = popup.querySelector(".profile-photo-popup-content");
    const closeIcon = popup.querySelector(".profile-photo-popup-close-icon");

    if (!content.contains(event.target) && event.target !== closeIcon) {
      popup.classList.add("hidden");
    }
  });
}

