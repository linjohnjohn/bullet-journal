export default class Dnd {
    constructor(parentElement, onNewDisplayOrder, onSaveNewOrder) {
        this.parentElement = parentElement;
        this.dataArray = [];
        this.draggingId = null;
        this.draggedOverId = null;
        this.onNewDisplayOrder = onNewDisplayOrder;
        this.onSaveNewOrder = onSaveNewOrder;

        this.parentElement.addEventListener('dragstart', (e) => {
            const dndId = e.target.dataset.dndId;
            if (!dndId) {
                return;
            }
            this.draggingId = dndId;
            e.target.classList.add('dnd-dragging');
        });

        this.parentElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dndId = e.target.dataset.dndId;
            if (!dndId) {
                return;
            }
            this.draggedOverId = dndId;
            const newArray = calculateChange(this.dataArray, this.draggingId, this.draggedOverId);
            this.dataArray = newArray;
            this.onNewDisplayOrder(newArray);
        });

        this.parentElement.addEventListener('dragend', (e) => {
            e.preventDefault();
            this.onSaveNewOrder(this.dataArray)
            e.target.classList.remove('dnd-dragging');
        });
    }
}

const calculateChange = (dataArray, draggingId, draggedOverId) => {
    const originIndex =  dataArray.findIndex(id => id === draggingId);
    const destIndex = dataArray.findIndex(id => id === draggedOverId);
    let newArray = [ ...dataArray ];
    newArray.splice(originIndex, 1);
    newArray.splice(destIndex, 0, draggingId);

    return newArray;
}