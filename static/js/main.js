// static/js/main.js
import { hideGlobalLoader } from './utils/utils.js';
import { initLivingCursor } from './utils/global-cursor.js';
import { initHeaderRibbon } from './ribbon-service/ribbon.js';
import { initProfileSection } from './profile-service/profile.js';
import { initNavigation } from './nav-service/nav.js';
import { initChat } from './chat-service/chat.js';
import { initFooter } from './footer-service/footer.js';


window.addEventListener('DOMContentLoaded', async () => {
  console.log("# Loading app...");

  await initLivingCursor();
  await initHeaderRibbon();
  await initProfileSection();
  await initNavigation();
  await initFooter();
  await initChat();

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  console.log("# App is ready...");
  hideGlobalLoader();
});
