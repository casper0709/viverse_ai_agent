document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('viewport');
    const dynamicTabsContainer = document.getElementById('dynamic-tabs');
    const tabTemplate = document.getElementById('tab-view-template');
    const chatTabNav = document.getElementById('tab-chat');

    // Chat specific elements
    const chatView = document.getElementById('chat-view');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    let chatHistory = [];

    class TabManager {
        constructor() {
            this.tabs = new Map(); // id -> { nav, view }
            this.activeTabId = 'chat';
        }

        createTab(url, title) {
            // Check if tab for this URL already exists
            const existingId = Array.from(this.tabs.entries())
                .find(([_, info]) => info.url === url)?.[0];

            if (existingId) {
                this.switchTab(existingId);
                return;
            }

            const id = 'tab-' + Math.random().toString(36).substr(2, 9);

            // Create Sidebar Nav Item
            const navItem = document.createElement('div');
            navItem.className = 'history-item';
            navItem.dataset.tabId = id;
            navItem.innerHTML = `
                <span class="icon">🌐</span>
                <span class="text">${this.truncateTitle(title)}</span>
                <button class="tab-close-small" title="Close Tab">×</button>
            `;
            navItem.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-close-small')) {
                    this.closeTab(id);
                } else {
                    this.switchTab(id);
                }
            });

            // Create View from Template
            const viewContent = tabTemplate.content.cloneNode(true);
            const viewSection = viewContent.querySelector('.view');
            viewSection.id = id;

            const iframe = viewSection.querySelector('iframe');
            iframe.src = url;

            viewSection.querySelector('.view-title').textContent = title;

            // Handle Restricted Sites (CSP)
            const isRestricted = url.includes('studio.viverse.com') || url.includes('avatar.viverse.com');
            if (isRestricted) {
                viewSection.querySelector('.csp-overlay').classList.remove('hidden');
            }

            // Wire up actions
            viewSection.querySelector('.close-view-btn').onclick = () => this.closeTab(id);
            viewSection.querySelectorAll('.open-external-btn').forEach(btn => {
                btn.onclick = () => window.open(url, '_blank');
            });

            // Append to DOM
            dynamicTabsContainer.appendChild(navItem);
            viewport.appendChild(viewSection);

            this.tabs.set(id, { nav: navItem, view: viewSection, url });
            this.switchTab(id);
        }

        switchTab(id) {
            // Deactivate current
            const current = this.tabs.get(this.activeTabId) || { nav: chatTabNav, view: chatView };
            current.nav.classList.remove('active');
            current.view.classList.remove('active');

            // Activate new
            const next = this.tabs.get(id) || { nav: chatTabNav, view: chatView };
            next.nav.classList.add('active');
            next.view.classList.add('active');

            this.activeTabId = id;
        }

        closeTab(id) {
            const info = this.tabs.get(id);
            if (!info) return;

            info.nav.remove();
            info.view.remove();
            this.tabs.delete(id);

            if (this.activeTabId === id) {
                this.switchTab('chat');
            }
        }

        truncateTitle(title) {
            return title.length > 20 ? title.substr(0, 17) + '...' : title;
        }
    }

    const tabManager = new TabManager();

    // Wire up static chat tab
    chatTabNav.addEventListener('click', () => tabManager.switchTab('chat'));

    // Intercept links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href) {
            const url = link.href;

            // Only intercept VIVERSE links or links inside chat
            const isViverse = url.includes('viverse.com');
            const isInChat = link.closest('#chat-messages');

            if (isViverse || isInChat) {
                // If it's the home page or a direct world link, open in dashboard tab
                e.preventDefault();
                tabManager.createTab(url, link.textContent || "VIVERSE View");
            }
        }
    });

    const addMessage = (text, sender) => {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${sender}`;
        bubble.innerHTML = marked.parse(text);
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return bubble;
    };

    const addTypingIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return indicator;
    };

    const handleSend = async () => {
        const message = userInput.value.trim();
        if (!message) return;

        userInput.value = '';
        userInput.style.height = 'auto';
        addMessage(message, 'user');

        const indicator = addTypingIndicator();

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: chatHistory })
            });

            const data = await response.json();
            indicator.remove();

            if (data.reply) {
                addMessage(data.reply, 'agent');
                chatHistory.push({ role: 'user', parts: [{ text: message }] });
                chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
            } else {
                addMessage('Sorry, I encountered an error.', 'system');
            }
        } catch (error) {
            indicator.remove();
            addMessage('Connectivity error.', 'system');
        }
    };

    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    });

    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    userInput.focus();
});
