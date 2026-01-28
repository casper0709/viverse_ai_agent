document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const lowerPreview = document.getElementById('lower-preview');
    const worldIframe = document.getElementById('world-iframe');
    const closePreviewBtn = document.getElementById('close-preview');
    const openExternalBtn = document.getElementById('open-external-preview');

    let chatHistory = [];
    let activeWorldUrl = "";

    function appendMessage(role, content = "") {
        const safeContent = content || "";
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${role}`;
        bubble.innerHTML = marked.parse(safeContent);
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage('user', message);
        userInput.value = '';
        userInput.style.height = 'auto';

        showTypingIndicator();

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: chatHistory })
            });

            const data = await response.json();
            removeTypingIndicator();

            const text = data.reply || data.response || data.content;

            if (data.success && text) {
                appendMessage('agent', text);
                chatHistory.push({ role: 'user', content: message });
                chatHistory.push({ role: 'assistant', content: text });
            } else {
                appendMessage('system', 'Error: ' + (data.error || 'Failed to get a valid response'));
            }
        } catch (error) {
            removeTypingIndicator();
            appendMessage('system', 'Connection error: ' + error.message);
        }
    }

    function openWorldPreview(url) {
        activeWorldUrl = url;
        worldIframe.src = url;
        lowerPreview.classList.remove('collapsed');
    }

    function closeWorldPreview() {
        lowerPreview.classList.add('collapsed');
        worldIframe.src = 'about:blank';
        activeWorldUrl = "";
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    closePreviewBtn.addEventListener('click', closeWorldPreview);
    openExternalBtn.addEventListener('click', () => {
        if (activeWorldUrl) window.open(activeWorldUrl, '_blank');
    });

    // Intercept links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href) {
            const url = link.href;

            // Detect VIVERSE World URLs
            const isWorld = url.includes('worlds.viverse.com') || url.includes('/world/');

            if (isWorld) {
                e.preventDefault();
                // Ensure ?full3d= is appended
                const finalUrl = url.includes('?') ? (url.includes('full3d=') ? url : `${url}&full3d=`) : `${url}?full3d=`;
                openWorldPreview(finalUrl);
            } else {
                // Force other links to open in new tab
                link.target = "_blank";
            }
        }
    });

    userInput.focus();
});
