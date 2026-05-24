import { getKnowledgeBase } from './knowledgeBase.js';

export function initChatbot() {
  const toggleBtn = document.getElementById('chat-toggle-btn');
  const chatWindow = document.getElementById('chat-window');
  const closeBtn = document.getElementById('close-chat');
  const messagesContainer = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');

  if (!toggleBtn || !chatWindow) return;

  // Toggle Window
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('active');
    if(chatWindow.classList.contains('active')) {
      chatInput.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('active');
  });

  // Welcome Message if empty
  if(messagesContainer.children.length === 0) {
    addBotMessage('¡Hola! Soy InmoIA, tu asistente virtual. ¿En qué te puedo ayudar hoy? (Ej: "busco piso", "¿tienen casas con piscina?", "hipoteca")');
  }

  // Handle Send
  const handleSend = () => {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Add user message
    addUserMessage(text);
    chatInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Process Response (Simulated AI Delay)
    setTimeout(() => {
      removeTypingIndicator();
      const response = generateResponse(text);
      addBotMessage(response);
    }, 1000 + Math.random() * 1000); // 1-2s delay
  };

  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  // --- Helper Functions --- //

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-bubble user-msg';
    div.textContent = text;
    messagesContainer.appendChild(div);
    scrollToBottom();
  }

  function addBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-bubble bot-msg';
    div.innerHTML = text; // Permite un poco de formato si es necesario
    messagesContainer.appendChild(div);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  let typingIndicator = null;
  function showTypingIndicator() {
    typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingIndicator);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    if (typingIndicator && typingIndicator.parentNode) {
      typingIndicator.parentNode.removeChild(typingIndicator);
      typingIndicator = null;
    }
  }

  // RAG Simulado (Motor de Búsqueda de Conocimiento)
  function generateResponse(text) {
    const lowerText = text.toLowerCase();
    
    // 1. Saludos por defecto
    if (lowerText.includes('hola') || lowerText.includes('buenos dias') || lowerText.includes('buenas tardes')) {
      return '¡Hola! Qué gusto saludarte. Soy el asistente de InmoTech. ¿Estás buscando comprar, vender o simplemente curioseando?';
    }

    // 2. Recuperación (Retrieval) del Knowledge Base
    const kb = getKnowledgeBase();
    let bestMatch = null;
    let maxMatches = 0;

    for (const fact of kb) {
      let matches = 0;
      for (const keyword of fact.keywords) {
        if (lowerText.includes(keyword)) {
          matches++;
        }
      }
      
      // Si este fact tiene más matches que el anterior, lo guardamos
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = fact;
      }
    }

    // 3. Generación (Generation)
    if (bestMatch && maxMatches > 0) {
      return bestMatch.answer;
    }

    // Respuesta por defecto si no encuentra coincidencia
    return 'Entiendo. Como soy un asistente virtual en entrenamiento, todavía no tengo esa información. ¿Te importaría dejar tu nombre y teléfono en el <a href="index.html#demo" style="color: var(--accent);">formulario</a> para que un agente experto te contacte directamente?';
  }
}
