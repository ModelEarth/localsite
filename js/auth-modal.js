// Shared Authentication Modal Component
// Used by both team/index.html and team/projects/map/index.html

class AuthModal {
    constructor() {
        this.modalId = 'auth-modal';
        this.modal = null;
        this.isLocal = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
        // Providers that are not yet configured (no credentials in .env)
        this.unconfiguredProviders = new Set(['facebook']);
        this.init();
    }

    init() {
        this.injectStyles();
        this.injectHTML();
        this.applyProviderVisibility();
        this.setupEventListeners();
    }

    injectStyles() {
        if (document.getElementById('auth-modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'auth-modal-styles';
        styles.textContent = `
            /* Auth Modal Styles */
            .auth-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 100000;
                justify-content: center;
                align-items: center;
            }

            .auth-modal.show {
                display: flex;
            }

            .auth-modal-content {
                background: white;
                border-radius: 12px;
                padding: 24px;
                width: 90%;
                max-width: 400px;
                position: relative;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            }

            /* Wider layout for short browser heights */
            @media (max-height: 700px) {
                .auth-modal-content {
                    max-width: 600px;
                    width: 95%;
                }
            }

            .auth-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 24px;
            }

            .auth-modal h3 {
                margin: 0;
                font-size: 1.3rem;
                color: #1a1a1a;
                flex: 1;
                text-align: center;
            }

            .auth-modal-close {
                background: #e5e7eb;
                border: none;
                cursor: pointer;
                width: 36px;
                height: 36px;
                color: #6b7280;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .auth-modal-close:hover {
                background: #d1d5db;
                color: #374151;
                transform: scale(1.05);
            }

            .auth-buttons {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            /* 2-column grid for short browser heights */
            @media (max-height: 700px) {
                .auth-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
            }
            /* Back to 1-column when also narrow */
            @media (max-width: 500px) {
                .auth-buttons {
                    display: flex;
                }
            }

            /* Handle small screens - full screen modal for 500px or less */
            @media (max-height: 500px) and (max-width: 500px) {
                .auth-modal {
                    align-items: flex-start;
                    padding: 0;
                    overflow-y: auto;
                }
                
                .auth-modal-content {
                    width: 100%;
                    height: 100vh;
                    max-width: none;
                    margin: 0;
                    border-radius: 0;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    box-shadow: none;
                }
                
                .auth-modal-header {
                    margin-bottom: 20px;
                    flex-shrink: 0;
                }
                
                .auth-modal h3 {
                    font-size: 1.2rem;
                }
                
                .auth-buttons {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 12px;
                }
                
                .auth-btn {
                    padding: 14px 16px;
                    font-size: 1rem;
                }
            }

            /* Extra small screens optimization */
            @media (max-height: 400px) or (max-width: 400px) {
                .auth-modal-content {
                    padding: 16px;
                }
                
                .auth-modal-header {
                    margin-bottom: 16px;
                }
                
                .auth-modal h3 {
                    font-size: 1.1rem;
                }
                
                .auth-btn {
                    padding: 12px 14px;
                    font-size: 0.9rem;
                }
                
                .auth-buttons {
                    gap: 10px;
                }
            }
            .auth-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 12px 16px;
                border: 1px solid #E5E7EB;
                border-radius: 8px;
                background: #FFFFFF;
                color: #374151;
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                width: 100%;
            }

            .auth-btn:hover {
                background: #F9FAFB;
                border-color: #D1D5DB;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .auth-btn:active {
                transform: translateY(0);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            /* Inactive/unconfigured provider styles */
            .auth-btn.inactive {
                opacity: 0.5;
                cursor: not-allowed;
                background: #F3F4F6;
                border-style: dashed;
                border-color: #D1D5DB;
            }

            .auth-btn.inactive:hover {
                transform: none;
                box-shadow: none;
                background: #F3F4F6;
                border-color: #D1D5DB;
            }

            .auth-btn.inactive svg {
                filter: grayscale(100%);
                opacity: 0.6;
            }

            .inactive-badge {
                margin-left: auto;
                font-size: 10px;
                font-weight: 500;
                color: #9CA3AF;
                background: #E5E7EB;
                padding: 2px 6px;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
        `;
        document.head.appendChild(styles);
    }

    injectHTML() {
        if (document.getElementById(this.modalId)) return;

        const modalHTML = `
            <div id="${this.modalId}" class="auth-modal" onclick="window.authModal.hide()">
                <div class="auth-modal-content" onclick="event.stopPropagation()">
                    <div class="auth-modal-header">
                        <h3>Sign in or create an account</h3>
                        <button class="auth-modal-close" onclick="window.authModal.hide()">
                            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="auth-buttons">
                        <button class="auth-btn" onclick="window.authModal.signInWith('google')">
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Continue with Google
                        </button>

                        <button class="auth-btn" onclick="window.authModal.signInWith('microsoft')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#00a4ef"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/></svg>
                            Continue with Microsoft
                        </button>

                        <button class="auth-btn" onclick="window.authModal.signInWith('discord')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.191.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                            Continue with Discord
                        </button>
            
                        <button class="auth-btn" onclick="window.authModal.signInWith('linkedin')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            Continue with LinkedIn
                        </button>

                        <button class="auth-btn" onclick="window.authModal.signInWith('facebook')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Continue with Facebook
                        </button>
                                                
                        <button class="auth-btn" onclick="window.authModal.signInWith('github')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            Continue with GitHub
                        </button>
                        
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById(this.modalId);
    }

    // Hide unconfigured providers in production, grey them out on localhost
    applyProviderVisibility() {
        const modal = this.modal;
        if (!modal) return;

        this.unconfiguredProviders.forEach(provider => {
            const btn = modal.querySelector(`[onclick*="'${provider}'"]`);
            if (!btn) return;

            if (this.isLocal) {
                // Localhost: show greyed out with "Not configured" badge
                btn.classList.add('inactive');
                const badge = document.createElement('span');
                badge.className = 'inactive-badge';
                badge.textContent = 'Not configured';
                btn.appendChild(badge);
            } else {
                // Production: hide completely
                btn.style.display = 'none';
            }
        });
    }

    setupEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });
    }

    show() {
        // Close left side panel if open
        if (typeof getHash === 'function') {
            let hash = getHash();
            if (hash.sidetab) {
                goHash({'sidetab':''});
            }
        }

        if (this.modal) {
            this.modal.classList.add('show');
        }
    }

    hide() {
        if (this.modal) {
            this.modal.classList.remove('show');
        }
    }

    isVisible() {
        return this.modal && this.modal.classList.contains('show');
    }

    async signInWith(provider) {
        console.log('Starting OAuth flow for provider:', provider);

        // Block unconfigured providers
        if (this.unconfiguredProviders.has(provider)) {
            alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not yet configured. Please use another provider.`);
            return;
        }

        this.hide();

        try {
            // Redirect back to the current page after OAuth completes
            const callbackURL = window.location.href;

            // Use configured API URL or fall back to localhost
           const apiBase = window.AUTH_API_URL || 'http://localhost:3002/api';
           
            // Better Auth OAuth flow - POST to get OAuth URL
            const response = await fetch(`${apiBase}/auth/sign-in/social`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    provider: provider,
                    callbackURL: callbackURL
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.url) {
                console.log(`[Auth Modal] Redirecting to ${provider} OAuth...`);
                window.location.href = data.url;
            } else {
                throw new Error('No OAuth URL received from server');
            }

        } catch (error) {
            console.error('OAuth error:', error);
            alert(`Failed to start ${provider} authentication: ${error.message}`);
        }
    }

}

// Check if user is authenticated and update UI
async function checkAuthSession() {
    try {
        // Use configured API URL or fall back to localhost
        const apiBase = window.AUTH_API_URL || 'http://localhost:3002/api';

        const response = await fetch(`${apiBase}/auth/get-session`, {
            credentials: 'include' // Send httpOnly cookie
        });

        if (response.ok) {
            const session = await response.json();
            if (session && session.user) {
                console.log('[Auth Modal] User is authenticated:', session.user);

                // Session is stored in httpOnly cookie on backend
                // No need to store in localStorage (security risk)

                // Update auth UI if authManager exists
                if (typeof authManager !== 'undefined' && authManager.initializeAuth) {
                    authManager.currentUser = session.user;
                    authManager.updateUI(true);
                } else if (typeof updateAuthUI === 'function') {
                    updateAuthUI();
                }

                return session.user;
            }
        }
    } catch (error) {
        console.error('[Auth Modal] Error checking session:', error);
    }
    return null;
}

// Initialize auth modal when DOM is loaded or immediately if DOM is already loaded
function initAuthModal() {
    if (!window.authModal) {
        window.authModal = new AuthModal();
    }

    // Check for authenticated session on page load
    checkAuthSession();
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthModal);
} else {
    // DOM is already loaded, initialize immediately
    initAuthModal();
}

// Global functions for backward compatibility
window.showAuthModal = () => window.authModal?.show();
window.hideAuthModal = () => window.authModal?.hide();