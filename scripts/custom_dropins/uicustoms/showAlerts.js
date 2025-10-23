export default function showERPMessage(message, onOk) {
    const popup = document.getElementById('erp-message-popup');
    const messageEl = popup.querySelector('.erp-popup-message');
    const okBtn = popup.querySelector('#erp-ok');
  
    messageEl.textContent = message;
    popup.classList.remove('hidden');
  
    okBtn.onclick = () => {
      popup.classList.add('hidden');
      if (onOk) onOk(); // call callback after user clicks OK
    };
  }
  