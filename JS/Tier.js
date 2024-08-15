const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const dropArea = $('#drop-area');
const itemsSection = $('#selector-items');
const imageInput = $('#image-input');
const resetButton = $('#reset-tier-button');
const saveButton = $('#save-tier-button');

let draggedElement = null;
let sourceContainer = null;

// Para dispositivos táctiles
let initialTouchPos = null;

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('drag-over');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('drag-over');
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('drag-over');

    const { files } = event.dataTransfer;
    useFilesToCreateItems(files);
});

function createItem(src, container) {
    const imgElement = document.createElement('img');
    imgElement.draggable = true;
    imgElement.src = src;
    imgElement.className = 'item-image';

    imgElement.addEventListener('dragstart', handleDragStart);
    imgElement.addEventListener('dragend', handleDragEnd);
    
    // Soporte para dispositivos táctiles
    imgElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    imgElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    imgElement.addEventListener('touchend', handleTouchEnd);

    container.appendChild(imgElement);
}

function useFilesToCreateItems(files) {
    if (files && files.length > 0) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();

            reader.onload = (eventReader) => {
                createItem(eventReader.target.result, itemsSection);
            };

            reader.readAsDataURL(file);
        });
    }
}

imageInput.addEventListener('change', (event) => {
    const { files } = event.target;
    useFilesToCreateItems(files);
});

const rows = $$('.tier .row');

rows.forEach(row => {
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragleave', handleDragLeave);
    
    // Para dispositivos táctiles
    row.addEventListener('touchmove', handleTouchMove, { passive: true });
    row.addEventListener('touchend', handleTouchEnd);
});

itemsSection.addEventListener('dragover', handleDragOver);
itemsSection.addEventListener('drop', handleDrop);
itemsSection.addEventListener('dragleave', handleDragLeave);

function handleDragStart(event) {
    draggedElement = event.target;
    sourceContainer = draggedElement.parentNode;
    event.dataTransfer.setData('text/plain', draggedElement.src);
}

function handleDragEnd() {
    draggedElement = null;
    sourceContainer = null;
}

function handleDragOver(event) {
    event.preventDefault();

    const currentTarget = event.currentTarget;

    if (sourceContainer === currentTarget) return;

    currentTarget.classList.add('drag-over');

    const dragPreview = document.querySelector('.drag-preview');

    if (draggedElement && !dragPreview) {
        const previewElement = draggedElement.cloneNode(true);
        previewElement.classList.add('drag-preview');
        currentTarget.appendChild(previewElement);
    }
}

function handleDrop(event) {
    event.preventDefault();

    const currentTarget = event.currentTarget;

    if (sourceContainer && draggedElement) {
        sourceContainer.removeChild(draggedElement);
    }

    if (draggedElement) {
        currentTarget.appendChild(draggedElement);
    }

    currentTarget.classList.remove('drag-over');
    currentTarget.querySelector('.drag-preview')?.remove();
}

function handleDragLeave(event) {
    event.preventDefault();

    const currentTarget = event.currentTarget;
    currentTarget.classList.remove('drag-over');
    currentTarget.querySelector('.drag-preview')?.remove();
}

// Funciones para soporte táctil
function handleTouchStart(event) {
    initialTouchPos = event.touches[0];
    draggedElement = event.target;
    sourceContainer = draggedElement.parentNode;
}

function handleTouchMove(event) {
    const touch = event.touches[0];

    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    if (targetElement && targetElement.classList.contains('row')) {
        targetElement.classList.add('drag-over');
    }

    if (targetElement && draggedElement && targetElement !== sourceContainer) {
        const dragPreview = document.querySelector('.drag-preview');

        if (!dragPreview) {
            const previewElement = draggedElement.cloneNode(true);
            previewElement.classList.add('drag-preview');
            targetElement.appendChild(previewElement);
        }
    }
}

function handleTouchEnd(event) {
    const touch = event.changedTouches[0];

    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    if (targetElement && draggedElement && targetElement !== sourceContainer) {
        sourceContainer.removeChild(draggedElement);
        targetElement.appendChild(draggedElement);
    }

    targetElement.classList.remove('drag-over');
    targetElement.querySelector('.drag-preview')?.remove();

    draggedElement = null;
    sourceContainer = null;
}

resetButton.addEventListener('click', () => {
    const items = $$('.tier .item-image');
    items.forEach(item => {
        item.remove();
        itemsSection.appendChild(item);
    });
});

saveButton.addEventListener('click', () => {
    const tierContainer = $('.tier');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    import('https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm')
        .then(({ default: html2canvas }) => {
            html2canvas(tierContainer).then(canvas => {
                ctx.drawImage(canvas, 0, 0);
                const imgURL = canvas.toDataURL('image/png');

                const downloadLink = document.createElement('a');
                downloadLink.download = 'tier.png';
                downloadLink.href = imgURL;
                downloadLink.click();
            });
        });
});

document.addEventListener('click', (event) => {
    const colorPickers = document.querySelectorAll('.color-picker');
    colorPickers.forEach((picker) => {
      const isClickInside = picker.contains(event.target) || picker === event.target;
  
      if (!isClickInside) {
        picker.blur(); // Pierde el foco, cerrando el selector de color
      }
    });
});

const colorPickers = document.querySelectorAll('.color-picker');
colorPickers.forEach((picker) => {
    picker.addEventListener('input', (event) => {
        const newColor = event.target.value;
        const label = picker.closest('.label');
        label.style.setProperty('--level', newColor);
    });
});
