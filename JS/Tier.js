const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const imageInput = $('#image-input');
const itemsSection = $('#selector-items');
const resetButton = $('#reset-button')

function createItem (src){
    const imgElement = document.createElement('img');
            imgElement.draggable = true;
            imgElement.src = src
            imgElement.className = 'item-image';

            imgElement.addEventListener('dragstart', handleDragStart);
            imgElement.addEventListener('dragend', handleDragEnd);  // Cambiado a `handleDragEnd`
            itemsSection.appendChild(imgElement);
            return imgElement;  
};

function useFilesToCreateItems(files){
    if (files && files.length > 0) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (eventReader) => {
                createItem(eventReader.target.result)
            };
            reader.readAsDataURL(file);
        })
    }
}

imageInput.addEventListener('change', (event) => {
    const files = event.target.files;
    useFilesToCreateItems(files)
});

let draggedElement = null;
let sourceContainer = null;

const rows = $$('.tier .row');

rows.forEach(row =>{
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('dragleave',  handleDragLeave);
});

    itemsSection.addEventListener('drop', handleDrop);
    itemsSection.addEventListener('dragover', handleDragOver);
    itemsSection.addEventListener('dragleave',  handleDragLeave);


    itemsSection.addEventListener('drop', handleDropFromDesktop);
    itemsSection.addEventListener('dragover', handleDragOverFromDesktop);

    function handleDragOverFromDesktop(event){
        event.preventDefault();
        const { currentTarget, dataTransfer } = event;

        if(dataTransfer.types.includes('Files')){
            currentTarget.classList.add('drag-files');
        }
    };

    function handleDropFromDesktop(event){
        event.preventDefault();
        const { currentTarget, dataTransfer } = event;
        if(dataTransfer.types.includes('Files')){
            currentTarget.classList.remove('drag-files');
            const {files} = dataTransfer
            useFilesToCreateItems(files);
        }
    }

function handleDrop(event){
    event.preventDefault();
    const { currentTarget, dataTransfer } = event;

    if (sourceContainer && draggedElement){
        sourceContainer.removeChild(draggedElement);
    }
    
    if(draggedElement){
        const src = dataTransfer.getData('text/plain');
        const imgElement = createItem(src);
        currentTarget.appendChild(imgElement);
    }
    currentTarget.classList.remove('drag-over');
    currentTarget.querySelector('.drag-preview')?.remove();
}
function handleDragOver(event){
    event.preventDefault();
    const { currentTarget, dataTransfer } = event;

    if(sourceContainer === currentTarget) return 
    currentTarget.classList.add('drag-over')

    const dragPreview = document.querySelector('.drag-preview');
    if (draggedElement && !dragPreview){
        const previewElement = draggedElement.cloneNode(true);
        previewElement.classList.add('drag-preview');
        currentTarget.appendChild(previewElement);
    }
}
function handleDragLeave(event) {
    event.preventDefault();
    const { currentTarget } = event;
    currentTarget.classList.remove('drag-over');
    currentTarget.querySelector('.drag-preview')?.remove();
}

function handleDragStart(event) {
    draggedElement = event.target;
    sourceContainer = draggedElement.parentNode;
    event.dataTransfer.setData('text/plain', draggedElement.src);
}

function handleDragEnd(event) {
    draggedElement = null;
    sourceContainer = null;
}


resetButton.addEventListener('click',() => {
    const items = $$('.tier .item-image');
    items.forEach(item =>{
        item.remove()
        itemsSection.appendChild(item);
    })
})