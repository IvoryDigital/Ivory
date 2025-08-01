// Referencias a elementos
const chatbotContainer = document.getElementById('chatbot-container');
const toggleBtn = document.getElementById('chatbot-toggle-btn');
const messagesContainer = document.getElementById('chatbot-messages');
const input = document.getElementById('chat-input-text');
const sendBtn = document.getElementById('chat-input-send');

// Crear botón cerrar dentro del chatbot
const closeBtn = document.createElement('button');
closeBtn.textContent = '✖';
closeBtn.title = 'Cerrar chat';
closeBtn.style.position = 'absolute';
closeBtn.style.top = '10px';
closeBtn.style.right = '10px';
closeBtn.style.background = 'transparent';
closeBtn.style.border = 'none';
closeBtn.style.color = '#0cb411';
closeBtn.style.fontSize = '20px';
closeBtn.style.cursor = 'pointer';

chatbotContainer.style.position = 'fixed';
chatbotContainer.appendChild(closeBtn);

// Estado inicial: chat oculto, botón visible
chatbotContainer.style.display = 'none';
toggleBtn.style.display = 'flex';

function addMessage(sender, text) {
  const msg = document.createElement('div');
  msg.textContent = `${sender}: ${text}`;
  msg.style.margin = '8px 0';
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

toggleBtn.addEventListener('click', () => {
  chatbotContainer.style.display = 'flex';
  toggleBtn.style.display = 'none';
  input.focus();
});

closeBtn.addEventListener('click', () => {
  chatbotContainer.style.display = 'none';
  toggleBtn.style.display = 'flex';
  input.value = '';
});

sendBtn.addEventListener('click', () => {
  sendMessage();
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage('Tú', text);
  input.value = '';

  // Muestra "Escribiendo..." mientras espera respuesta
  addMessage('Bot', 'Escribiendo...');

  try {
    const response = await fetch('https://ivory-180693770083.europe-west1.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mensaje: text })
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.statusText}`);
    }

    const data = await response.json();

    // Elimina el "Escribiendo..." anterior
    const writingMsg = [...messagesContainer.children].find(div => div.textContent === 'Bot: Escribiendo...');
    if (writingMsg) messagesContainer.removeChild(writingMsg);

    if (data.respuesta) {
      addMessage('Bot', data.respuesta);
    } else if (data.error) {
      addMessage('Bot', 'Error del servidor: ' + data.error);
    } else {
      addMessage('Bot', 'Respuesta inesperada del servidor.');
    }
  } catch (error) {
    // Elimina el "Escribiendo..." anterior
    const writingMsg = [...messagesContainer.children].find(div => div.textContent === 'Bot: Escribiendo...');
    if (writingMsg) messagesContainer.removeChild(writingMsg);

    addMessage('Bot', 'Error al comunicarse con el servidor: ' + error.message);
  }
}
