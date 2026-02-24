
(function () {
  // 1. Inject Modal HTML
  const modalHTML = `
    <div id="signin-modal" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeSignInModal()"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6">
            <div class="bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                <button onclick="closeSignInModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <span class="iconify w-5 h-5" data-icon="lucide:x"></span>
                </button>
                <div class="text-center">
                    <div class="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="iconify w-6 h-6" data-icon="lucide:info"></span>
                    </div>
                    <h3 class="text-xl font-medium text-white mb-2">Authentication Unavailable</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        We are working on authentication. You can buy any product securely using Gumroad and SuperProfile without authentication.
                    </p>
                    <button onclick="closeSignInModal()" class="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // 2. Define global functions
  window.openSignInModal = function () {
    const modal = document.getElementById('signin-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeSignInModal = function () {
    const modal = document.getElementById('signin-modal');
    if (modal) modal.classList.add('hidden');
  };

  // 3. Attach listeners to "Sign In" buttons
  // We look for buttons that contain "Sign In" text
  function attachSignInListeners() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.innerText.trim() === 'Sign In') {
        btn.onclick = (e) => {
          e.preventDefault();
          window.openSignInModal();
        };
      }
    });
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachSignInListeners);
  } else {
    attachSignInListeners();
  }
})();
