const socket = io()
let name = prompt('Please enter your name:') || 'Anonymous'

const textarea = document.querySelector('#textarea')
const messageArea = document.querySelector('.message__area')
const imageUploadBtn = document.querySelector('#image-upload')
const fileInput = document.querySelector('#file-input')
const sendButton = document.querySelector('#send-button')
const userNameElement = document.querySelector('#user-name')

// Set user name in UI
userNameElement.textContent = name

// Clear any initial whitespace
textarea.value = ''

// Handle image upload
imageUploadBtn.addEventListener('click', () => {
  fileInput.click()
})

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target.result
      appendMessage({ user: name, message: '', image: imageData }, 'outgoing')
      scrollToBottom()
      socket.emit('message', { user: name, message: '', image: imageData })
    }
    reader.readAsDataURL(file)
  }
})

// Handle message sending
function sendMessage() {
  const message = textarea.value.trim()
  if (message) {
    appendMessage({ user: name, message }, 'outgoing')
    textarea.value = ''
    scrollToBottom()
    socket.emit('message', { user: name, message })
  }
}

textarea.addEventListener('keyup', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
})

sendButton.addEventListener('click', sendMessage)

function appendMessage({ user, message, image }, type) {
  const messageElement = document.createElement('div')
  messageElement.className = `flex ${type === 'incoming' ? '' : 'justify-end'}`

  const messageContent = `
        <div class="${type === 'incoming' ? 'bg-white' : 'bg-blue-500'} 
             ${type === 'incoming' ? 'text-gray-800' : 'text-white'}
             rounded-xl p-4 max-w-[70%] shadow-sm">
            <div class="font-medium text-sm mb-1">${user}</div>
            ${
              image
                ? `<img src="${image}" alt="Shared image" class="rounded-lg max-w-full h-auto mb-2">`
                : ''
            }
            ${message ? `<p>${message}</p>` : ''}
            <div class="text-xs ${
              type === 'incoming' ? 'text-gray-500' : 'text-blue-100'
            } mt-1">
                ${new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
            </div>
        </div>
    `

  messageElement.innerHTML = messageContent
  messageArea.appendChild(messageElement)
}

function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight
}

socket.on('message', (msg) => {
  appendMessage(msg, 'incoming')
  scrollToBottom()
})
