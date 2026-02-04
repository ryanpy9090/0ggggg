// NAVIGATION
const navLinks = document.querySelectorAll('.nav-links li');
const modules = document.querySelectorAll('.module');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const target = link.getAttribute('data-target');
        switchTab(target);
    });
});

function switchTab(targetId) {
    // Update Nav
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-links li[data-target="${targetId}"]`).classList.add('active');

    // Update Modules
    modules.forEach(m => m.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
}

// VIDEO BACKGROUND GENERATOR
const genVideoBtn = document.getElementById('generate-video-btn');
const videoPrompt = document.getElementById('video-prompt');

if (genVideoBtn) {
    genVideoBtn.addEventListener('click', async () => {
        const prompt = videoPrompt.value;
        if (!prompt) return;

        // Post "Thinking" message to chat since we are invisible
        const chatHistory = document.getElementById('chat-history');
        const aiMsgDiv = document.createElement('div');
        aiMsgDiv.className = `msg ai`;
        aiMsgDiv.innerHTML = `
            <div class="avatar"><ion-icon name="videocam"></ion-icon></div>
            <div class="bubble">Initializing CineSynth protocol...</div>
        `;
        chatHistory.appendChild(aiMsgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        try {
            // POLLINATIONS AI (High-Res Image as 'Video Frame')
            const seed = Math.floor(Math.random() * 100000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&nologo=true`;

            // PRELOAD CHECKS via Fetch with RETRY Logic
            let response;
            let retries = 500; // SUPER PERSISTENCE MODE (500 attempts)

            // Priority Model List - Rotates through all models
            const models = [
                'nanobanana', 'gptimage', 'dreamshaper', 'absolute-reality', 'majicmix-realistic',
                'kontext', 'zimage', 'flux-schnell', 'flux-pro', 'klein-large',
                'seedream', 'midjourney', 'flux', 'turbo', 'sdxl',
                'flux-realism', 'flux-anime', 'flux-3d', 'any-dark', 'pixart',
                'openjourney', 'sd3', 'playground', 'dalle', 'omnigen'
            ];

            while (retries > 0) {
                try {
                    // Calculate current model using modulo operator for infinite rotation
                    const modelIndex = (500 - retries) % models.length;
                    const currentModel = models[modelIndex];

                    // Update Chat Bubble (every 5 retries or so to avoid flickering)
                    if (retries % 5 === 0) {
                        const bubble = aiMsgDiv.querySelector('.bubble');
                        // Capitalize logic for display
                        const displayModel = currentModel.charAt(0).toUpperCase() + currentModel.slice(1);
                        bubble.innerText = `Rendering (${displayModel})... Loading: ${Math.min(100, Math.floor(((500 - retries) / 500) * 100))}%`;
                    }

                    const currentUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${currentModel}&seed=${seed}&nologo=true`;

                    response = await fetch(currentUrl);
                    if (response.ok) break; // Success!

                    if (response.status === 502 || response.status === 503 || response.status === 504) {
                        retries--;
                        await new Promise(r => setTimeout(r, 500)); // Faster retries
                    } else {
                        throw new Error(`Server Error: ${response.status}`);
                    }
                } catch (e) {
                    if (retries <= 1) throw e;
                    retries--;
                    await new Promise(r => setTimeout(r, 500)); // Faster retries
                }
            }

            if (!response || !response.ok) throw new Error("Server Overloaded.");

            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);

            // RENDER IN CHAT
            aiMsgDiv.innerHTML = `
                <div class="avatar"><ion-icon name="videocam"></ion-icon></div>
                <div class="bubble" style="background: transparent; border: none; padding: 0;">
                    <img src="${objectURL}" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transform: scale(1); transition: transform 5s ease;">
                    <p style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.7;">Video Preview: ${prompt}</p>
                    <button onclick="(function(){const a=document.createElement('a');a.href='${objectURL}';a.download='ryan-video-${Date.now()}.png';a.click();})()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.3)'"><ion-icon name="download-outline" style="vertical-align: middle; margin-right: 0.3rem;"></ion-icon>Download Video</button>
                </div>
            `;

            // "Ken Burns" Animation
            setTimeout(() => {
                const img = aiMsgDiv.querySelector('img');
                if (img) img.style.transform = "scale(1.1)";
            }, 100);

        } catch (error) {
            const bubble = aiMsgDiv.querySelector('.bubble');
            bubble.innerText = "Video Generation Failed: " + error.message;
            bubble.style.color = "#ff4757";
        }
    });
}


// SETTINGS & MODAL
const settingsBtn = document.querySelector('.settings');
const modal = document.getElementById('settings-modal');
const closeModal = document.querySelector('.close-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const openaiKeyInput = document.getElementById('openai-key');
const geminiKeyInput = document.getElementById('gemini-key');
const hfKeyInput = document.getElementById('hf-key');

// Load stored keys
openaiKeyInput.value = localStorage.getItem('openai_key') || '';
geminiKeyInput.value = localStorage.getItem('gemini_key') || '';
hfKeyInput.value = localStorage.getItem('hf_key') || '';

settingsBtn.addEventListener('click', () => {
    modal.classList.add('active');
    // Display user email
    if (window.currentUser) {
        document.getElementById('user-email').textContent = window.currentUser.email;
    }
});
closeModal.addEventListener('click', () => modal.classList.remove('active'));
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

saveSettingsBtn.addEventListener('click', async () => {
    localStorage.setItem('openai_key', openaiKeyInput.value);
    localStorage.setItem('gemini_key', geminiKeyInput.value);
    localStorage.setItem('hf_key', hfKeyInput.value);

    // Sync to cloud
    if (window.syncToCloud) {
        await window.syncToCloud();
    }

    modal.classList.remove('active');
    alert("System config updated and synced to cloud.");
});


// DIAGNOSTIC TOOL
document.getElementById('gemini-key').addEventListener('change', async (e) => {
    const key = e.target.value;
    if (!key) return;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:", data.models.map(m => m.name));
            alert("Valid Key! Check console (F12) for available models. Setting default to: " + data.models[0].name);
        } else {
            alert("Key appears invalid or no models found.");
        }
    } catch (err) {
        console.error(err);
    }
});

// ===== LIBRARY FUNCTIONALITY =====
let currentChatId = null;
let chats = JSON.parse(localStorage.getItem('ryan_chats') || '[]');

// Load chat list on page load
function loadChatList() {
    const chatList = document.getElementById('chat-list');

    if (chats.length === 0) {
        chatList.innerHTML = `
            <div class="empty-library">
                <ion-icon name="chatbubbles-outline"></ion-icon>
                <h3>No chats yet</h3>
                <p>Click "New Chat" to start a conversation</p>
            </div>
        `;
        return;
    }

    chatList.innerHTML = chats.map((chat, index) => `
        <div class="chat-item" data-chat-id="${chat.id}">
            <div class="chat-item-header">
                <div>
                    <div class="chat-item-title">${chat.title}</div>
                    <div class="chat-item-date">${new Date(chat.timestamp).toLocaleDateString()}</div>
                </div>
                <button class="chat-item-delete" onclick="deleteChat('${chat.id}', event)">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            </div>
            <div class="chat-item-preview">${chat.preview}</div>
        </div>
    `).join('');

    // Add click handlers to chat items
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-item-delete')) {
                openChat(item.dataset.chatId);
            }
        });
    });
}

// Create new chat
document.getElementById('new-chat-btn').addEventListener('click', () => {
    const chatId = 'chat_' + Date.now();
    currentChatId = chatId;

    // Clear chat history
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = `
        <div class="msg ai">
            <div class="avatar"><ion-icon name="planet"></ion-icon></div>
            <div class="bubble">Hello. I am Cortex. How can I assist you today?</div>
        </div>
    `;

    // Switch to chat view
    switchTab('chat');
});

// Open existing chat
function openChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    currentChatId = chatId;

    // Load chat messages
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = chat.messages;

    // Switch to chat view
    switchTab('chat');
}

// Delete chat
function deleteChat(chatId, event) {
    event.stopPropagation();

    if (confirm('Delete this chat?')) {
        chats = chats.filter(c => c.id !== chatId);
        localStorage.setItem('ryan_chats', JSON.stringify(chats));
        loadChatList();

        if (currentChatId === chatId) {
            currentChatId = null;
        }
    }
}

// Save current chat
function saveCurrentChat() {
    if (!currentChatId) return;

    const chatHistory = document.getElementById('chat-history');
    const messages = chatHistory.innerHTML;

    // Extract first user message as title
    const firstUserMsg = chatHistory.querySelector('.msg.user .bubble');
    const title = firstUserMsg ? firstUserMsg.textContent.substring(0, 50) : 'New Chat';

    // Extract preview from last message
    const lastMsg = chatHistory.querySelector('.msg:last-child .bubble');
    const preview = lastMsg ? lastMsg.textContent.substring(0, 100) : '';

    // Update or create chat
    const existingIndex = chats.findIndex(c => c.id === currentChatId);
    const chatData = {
        id: currentChatId,
        title: title,
        preview: preview,
        timestamp: Date.now(),
        messages: messages
    };

    if (existingIndex >= 0) {
        chats[existingIndex] = chatData;
    } else {
        chats.unshift(chatData);
    }

    localStorage.setItem('ryan_chats', JSON.stringify(chats));
}

// Auto-save chat after each message
const originalAddMessage = addMessage;
function addMessage(text, sender, isLoading = false) {
    const result = originalAddMessage(text, sender, isLoading);
    setTimeout(() => saveCurrentChat(), 500);
    return result;
}

// Load chat list on startup
loadChatList();

// CHAT logic
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-chat-btn');
const chatHistory = document.getElementById('chat-history');

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const provider = document.getElementById('chat-provider').value;
    const openaiKey = localStorage.getItem('openai_key');
    const geminiKey = localStorage.getItem('gemini_key');

    // 0. Check for VIDEO command
    if (text.toLowerCase().startsWith('/video') || text.toLowerCase().startsWith('generate video')) {
        addMessage(text, 'user');
        chatInput.value = '';

        const cleanPrompt = text.replace(/^\/video|generate video/i, '').trim();
        if (!cleanPrompt) {
            addMessage("Please provide a prompt for the video.", 'ai');
            return;
        }

        // TRIGGER BACKGROUND GENERATION
        const videoInput = document.getElementById('video-prompt');
        if (videoInput) videoInput.value = cleanPrompt;

        const genBtn = document.getElementById('generate-video-btn');
        if (genBtn) {
            genBtn.click(); // This now posts to chat directly
        }
        return;
    }

    // 1. Check for IMAGE command
    if (text.toLowerCase().startsWith('/image') || text.toLowerCase().startsWith('generate image') || text.toLowerCase().startsWith('draw')) {
        addMessage(text, 'user');
        chatInput.value = '';

        const aiMsgDiv = addMessage("Generating visual artifact...", 'ai', true);
        const cleanPrompt = text.replace(/^\/image|generate image|draw/i, '').trim();

        try {
            let blob;
            const hfToken = localStorage.getItem('hf_key');

            // STRATEGY A: NANOBANANA (Primary - Free & High Quality)
            updateAiMessage(aiMsgDiv, "Generating with NanoBanana...");
            const seed = Math.floor(Math.random() * 100000);

            try {
                const nanoResp = await fetch(
                    `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?model=nanobanana&seed=${seed}&nologo=true`
                );

                if (nanoResp.ok) {
                    blob = await nanoResp.blob();
                }
            } catch (e) {
                console.log("NanoBanana failed, trying fallback...");
            }

            // STRATEGY B: HUGGING FACE (If API key exists and NanoBanana failed)
            if (!blob && hfToken) {
                updateAiMessage(aiMsgDiv, "Generating with FLUX.1 (HuggingFace)...");
                const response = await fetch(
                    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
                    {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${hfToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ inputs: cleanPrompt }),
                    }
                );

                if (response.ok) {
                    blob = await response.blob();
                }
            }

            // STRATEGY C: POLLINATIONS (Fast Free Fallback)
            if (!blob) {
                const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?seed=${seed}&nologo=true`;

                let response;
                let retries = 5;

                while (retries > 0) {
                    try {
                        updateAiMessage(aiMsgDiv, `Generating (Pollinations attempt ${6 - retries}/5)...`);
                        response = await fetch(imageUrl);
                        if (response.ok) break;
                        retries--;
                        await new Promise(r => setTimeout(r, 1000));
                    } catch (e) { retries--; }
                }

                if (response && response.ok) {
                    blob = await response.blob();
                } else {
                    // STRATEGY C: AI HORDE (Queue-based Free Fallback)
                    updateAiMessage(aiMsgDiv, "Pollinations busy. Switching to AI Horde (Crowdsourced)...");

                    // 1. Submit Job
                    const hordeResp = await fetch("https://stablehorde.net/api/v2/generate/async", {
                        method: "POST",
                        headers: { "apikey": "0000000000", "Content-Type": "application/json" },
                        body: JSON.stringify({
                            prompt: cleanPrompt,
                            params: { n: 1, width: 512, height: 512 },
                            models: ["stable_diffusion"],
                            nsfw: false,
                            censor_nsfw: true
                        })
                    });

                    if (!hordeResp.ok) throw new Error("Horde refused job.");
                    const ticket = await hordeResp.json();

                    // 2. Poll for result
                    let done = false;
                    let attempts = 0;
                    while (!done && attempts < 60) {
                        attempts++;
                        await new Promise(r => setTimeout(r, 2000));
                        updateAiMessage(aiMsgDiv, `Queued in AI Horde... (Waited ${attempts * 2}s)`);

                        const checkResp = await fetch(`https://stablehorde.net/api/v2/generate/check/${ticket.id}`);
                        const checkData = await checkResp.json();
                        if (checkData.done) done = true;
                    }

                    if (!done) throw new Error("Timed out waiting for Horde worker.");

                    // 3. Get Image
                    const statusResp = await fetch(`https://stablehorde.net/api/v2/generate/status/${ticket.id}`);
                    const statusData = await statusResp.json();
                    const imgUrl = statusData.generations[0].img;

                    // Fetch blob from Horde URL
                    const imgFetch = await fetch(imgUrl);
                    blob = await imgFetch.blob();
                }
            }

            const objectURL = URL.createObjectURL(blob);

            // Replace "Generating..." with the image
            aiMsgDiv.innerHTML = `
                <div class="avatar"><ion-icon name="color-palette"></ion-icon></div>
                <div class="bubble" style="background: transparent; border: none; padding: 0;">
                    <img src="${objectURL}" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <p style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.7;">Generated: ${cleanPrompt}</p>
                    <button onclick="(function(){const a=document.createElement('a');a.href='${objectURL}';a.download='ryan-image-${Date.now()}.png';a.click();})()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.3)'"><ion-icon name="download-outline" style="vertical-align: middle; margin-right: 0.3rem;"></ion-icon>Download Image</button>
                </div>
            `;
        } catch (error) {
            updateAiMessage(aiMsgDiv, "Generation Failed: " + (error.message || "Unknown Error"));
        }
        return; // PREVENT LLM CALL
    }

    // 2. Normal Chat Logic
    if (provider === 'openai' && !openaiKey) {
        alert("Please configure your OpenAI API Key!");
        modal.classList.add('active');
        return;
    }
    if (provider === 'gemini' && !geminiKey) {
        alert("Please configure your Gemini API Key!");
        modal.classList.add('active');
        return;
    }

    addMessage(text, 'user');
    chatInput.value = '';

    const aiMsgDiv = addMessage("Thinking...", 'ai', true);

    try {
        let aiText = "";
        if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: text }]
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            aiText = data.choices[0].message.content;
        } else {
            // Gemini API: Dynamic Model Discovery
            const modelsResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
            const modelsData = await modelsResp.json();

            if (!modelsData.models) {
                console.error("Model List Error:", modelsData);
                throw new Error("Invalid API Key or no models available.");
            }

            const validModel = modelsData.models.find(m =>
                m.supportedGenerationMethods &&
                m.supportedGenerationMethods.includes("generateContent") &&
                m.name.includes("gemini")
            );

            if (!validModel) {
                throw new Error("No compatible chat models found for this API key.");
            }

            console.log("Using Gemini Model:", validModel.name);

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }]
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            aiText = data.candidates[0].content.parts[0].text;
        }

        updateAiMessage(aiMsgDiv, aiText);

    } catch (error) {
        updateAiMessage(aiMsgDiv, "ERROR: " + error.message);
    }
}

function addMessage(text, sender, isLoading = false) {
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.innerHTML = `
        <div class="avatar"><ion-icon name="${sender === 'ai' ? 'planet' : 'person'}"></ion-icon></div>
        <div class="bubble">${text}</div>
    `;
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return div;
}

function updateAiMessage(div, newText) {
    const bubble = div.querySelector('.bubble');
    bubble.innerText = newText;
    chatHistory.scrollTop = chatHistory.scrollHeight;
}


