class WorksheetApp {
    constructor() {
        this.worksheets = [];
        this.currentWorksheet = null;
        this.selectedCell = null;
        this.cellData = {};
        this.currentWorksheetId = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createDefaultWorksheet();
        this.generateTable(10, 10); // Default 10x10 table
        this.updateWorksheetList();
    }

    setupEventListeners() {
        // Header buttons
        document.getElementById('newWorksheetBtn').addEventListener('click', () => this.createNewWorksheet());
        document.getElementById('saveBtn').addEventListener('click', () => this.showSaveModal());
        document.getElementById('loadBtn').addEventListener('click', () => this.showLoadModal());
        
        // Sidebar
        document.getElementById('addWorksheetBtn').addEventListener('click', () => this.createNewWorksheet());
        
        // Toolbar
        document.getElementById('boldBtn').addEventListener('click', () => this.toggleFormat('bold'));
        document.getElementById('italicBtn').addEventListener('click', () => this.toggleFormat('italic'));
        document.getElementById('underlineBtn').addEventListener('click', () => this.toggleFormat('underline'));
        document.getElementById('alignLeftBtn').addEventListener('click', () => this.setAlignment('left'));
        document.getElementById('alignCenterBtn').addEventListener('click', () => this.setAlignment('center'));
        document.getElementById('alignRightBtn').addEventListener('click', () => this.setAlignment('right'));
        document.getElementById('fontSizeSelect').addEventListener('change', () => this.changeFontSize());
        document.getElementById('textColorPicker').addEventListener('change', () => this.changeTextColor());
        document.getElementById('bgColorPicker').addEventListener('change', () => this.changeBgColor());
        
        // Table manipulation
        document.getElementById('insertRowBtn').addEventListener('click', () => this.insertRow());
        document.getElementById('insertColBtn').addEventListener('click', () => this.insertColumn());
        document.getElementById('deleteRowBtn').addEventListener('click', () => this.deleteRow());
        document.getElementById('deleteColBtn').addEventListener('click', () => this.deleteColumn());
        
        // Formula bar
        document.getElementById('formulaInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.applyFormula();
        });
        document.getElementById('applyFormulaBtn').addEventListener('click', () => this.applyFormula());
        
        // Worksheet title
        document.getElementById('worksheetTitle').addEventListener('input', () => this.updateWorksheetTitle());
        
        // Modal events
        document.getElementById('confirmSaveBtn').addEventListener('click', () => this.saveWorksheet());
        document.getElementById('cancelSaveBtn').addEventListener('click', () => this.hideSaveModal());
        document.getElementById('cancelLoadBtn').addEventListener('click', () => this.hideLoadModal());
        
        // Close modals on background click
        document.getElementById('saveModal').addEventListener('click', (e) => {
            if (e.target.id === 'saveModal') this.hideSaveModal();
        });
        document.getElementById('loadModal').addEventListener('click', (e) => {
            if (e.target.id === 'loadModal') this.hideLoadModal();
        });
    }

    createDefaultWorksheet() {
        this.currentWorksheet = {
            id: ++this.currentWorksheetId,
            title: 'Új Munkalap',
            data: {},
            rows: 10,
            cols: 10,
            created: new Date(),
            modified: new Date()
        };
        this.worksheets.push(this.currentWorksheet);
        this.cellData = this.currentWorksheet.data;
    }

    createNewWorksheet() {
        const worksheet = {
            id: ++this.currentWorksheetId,
            title: `Munkalap ${this.currentWorksheetId}`,
            data: {},
            rows: 10,
            cols: 10,
            created: new Date(),
            modified: new Date()
        };
        
        this.worksheets.push(worksheet);
        this.switchToWorksheet(worksheet);
        this.updateWorksheetList();
    }

    switchToWorksheet(worksheet) {
        this.currentWorksheet = worksheet;
        this.cellData = worksheet.data;
        document.getElementById('worksheetTitle').value = worksheet.title;
        this.generateTable(worksheet.rows, worksheet.cols);
        this.updateInfo();
    }

    updateWorksheetList() {
        const listContainer = document.getElementById('worksheetList');
        listContainer.innerHTML = '';
        
        this.worksheets.forEach(worksheet => {
            const item = document.createElement('div');
            item.className = 'worksheet-item';
            if (worksheet.id === this.currentWorksheet.id) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 4px;">${worksheet.title}</div>
                <div style="font-size: 0.8rem; color: #718096;">
                    ${this.formatDate(worksheet.modified)}
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.switchToWorksheet(worksheet);
                this.updateWorksheetList();
            });
            
            listContainer.appendChild(item);
        });
    }

    generateTable(rows, cols) {
        const table = document.getElementById('worksheetTable');
        table.innerHTML = '';
        
        // Create header row
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // Empty corner cell
        
        for (let col = 0; col < cols; col++) {
            const th = document.createElement('th');
            th.textContent = this.getColumnName(col);
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);
        
        // Create data rows
        for (let row = 0; row < rows; row++) {
            const tr = document.createElement('tr');
            
            // Row header
            const rowHeader = document.createElement('th');
            rowHeader.textContent = row + 1;
            tr.appendChild(rowHeader);
            
            // Data cells
            for (let col = 0; col < cols; col++) {
                const td = document.createElement('td');
                const cellId = `${row}-${col}`;
                td.dataset.row = row;
                td.dataset.col = col;
                td.dataset.cellId = cellId;
                
                // Load existing data
                const cellInfo = this.cellData[cellId];
                if (cellInfo) {
                    td.textContent = cellInfo.value || '';
                    this.applyCellStyle(td, cellInfo.style);
                }
                
                td.addEventListener('click', () => this.selectCell(td));
                td.addEventListener('dblclick', () => this.editCell(td));
                
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        
        this.updateInfo();
    }

    getColumnName(index) {
        let result = '';
        while (index >= 0) {
            result = String.fromCharCode(65 + (index % 26)) + result;
            index = Math.floor(index / 26) - 1;
        }
        return result;
    }

    selectCell(cell) {
        // Remove previous selection
        const previousSelected = document.querySelector('.worksheet-table td.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Select new cell
        cell.classList.add('selected');
        this.selectedCell = cell;
        
        // Update formula bar
        const cellId = cell.dataset.cellId;
        const cellInfo = this.cellData[cellId];
        document.getElementById('formulaInput').value = cellInfo ? (cellInfo.formula || cellInfo.value || '') : '';
    }

    editCell(cell) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cell-input';
        input.value = cell.textContent;
        
        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        input.select();
        
        const finishEdit = () => {
            const value = input.value;
            cell.innerHTML = value;
            
            const cellId = cell.dataset.cellId;
            if (!this.cellData[cellId]) {
                this.cellData[cellId] = {};
            }
            this.cellData[cellId].value = value;
            
            // Check if it's a formula
            if (value.startsWith('=')) {
                this.cellData[cellId].formula = value;
                try {
                    const result = this.evaluateFormula(value);
                    cell.textContent = result;
                    this.cellData[cellId].value = result;
                } catch (error) {
                    cell.textContent = '#ERROR';
                    this.cellData[cellId].value = '#ERROR';
                }
            }
            
            this.updateModified();
            this.updateInfo();
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });
    }

    evaluateFormula(formula) {
        // Simple formula evaluation (extend as needed)
        const expr = formula.substring(1); // Remove =
        
        // Replace cell references with values
        const cellRefRegex = /([A-Z]+)(\d+)/g;
        const processedExpr = expr.replace(cellRefRegex, (match, col, row) => {
            const colIndex = this.getColumnIndex(col);
            const rowIndex = parseInt(row) - 1;
            const cellId = `${rowIndex}-${colIndex}`;
            const cellInfo = this.cellData[cellId];
            return cellInfo && cellInfo.value ? parseFloat(cellInfo.value) || 0 : 0;
        });
        
        // Simple math evaluation (be careful with eval in production)
        try {
            return eval(processedExpr);
        } catch (error) {
            throw new Error('Invalid formula');
        }
    }

    getColumnIndex(columnName) {
        let result = 0;
        for (let i = 0; i < columnName.length; i++) {
            result = result * 26 + (columnName.charCodeAt(i) - 64);
        }
        return result - 1;
    }

    toggleFormat(format) {
        if (!this.selectedCell) return;
        
        const cellId = this.selectedCell.dataset.cellId;
        if (!this.cellData[cellId]) {
            this.cellData[cellId] = { style: {} };
        }
        if (!this.cellData[cellId].style) {
            this.cellData[cellId].style = {};
        }
        
        const currentValue = this.cellData[cellId].style[format];
        this.cellData[cellId].style[format] = !currentValue;
        
        this.applyCellStyle(this.selectedCell, this.cellData[cellId].style);
        this.updateModified();
    }

    setAlignment(align) {
        if (!this.selectedCell) return;
        
        const cellId = this.selectedCell.dataset.cellId;
        if (!this.cellData[cellId]) {
            this.cellData[cellId] = { style: {} };
        }
        if (!this.cellData[cellId].style) {
            this.cellData[cellId].style = {};
        }
        
        this.cellData[cellId].style.textAlign = align;
        this.applyCellStyle(this.selectedCell, this.cellData[cellId].style);
        this.updateModified();
    }

    changeFontSize() {
        if (!this.selectedCell) return;
        
        const fontSize = document.getElementById('fontSizeSelect').value;
        const cellId = this.selectedCell.dataset.cellId;
        
        if (!this.cellData[cellId]) {
            this.cellData[cellId] = { style: {} };
        }
        if (!this.cellData[cellId].style) {
            this.cellData[cellId].style = {};
        }
        
        this.cellData[cellId].style.fontSize = fontSize + 'px';
        this.applyCellStyle(this.selectedCell, this.cellData[cellId].style);
        this.updateModified();
    }

    changeTextColor() {
        if (!this.selectedCell) return;
        
        const color = document.getElementById('textColorPicker').value;
        const cellId = this.selectedCell.dataset.cellId;
        
        if (!this.cellData[cellId]) {
            this.cellData[cellId] = { style: {} };
        }
        if (!this.cellData[cellId].style) {
            this.cellData[cellId].style = {};
        }
        
        this.cellData[cellId].style.color = color;
        this.applyCellStyle(this.selectedCell, this.cellData[cellId].style);
        this.updateModified();
    }

    changeBgColor() {
        if (!this.selectedCell) return;
        
        const color = document.getElementById('bgColorPicker').value;
        const cellId = this.selectedCell.dataset.cellId;
        
        if (!this.cellData[cellId]) {
            this.cellData[cellId] = { style: {} };
        }
        if (!this.cellData[cellId].style) {
            this.cellData[cellId].style = {};
        }
        
        this.cellData[cellId].style.backgroundColor = color;
        this.applyCellStyle(this.selectedCell, this.cellData[cellId].style);
        this.updateModified();
    }

    applyCellStyle(cell, style) {
        if (!style) return;
        
        if (style.bold) cell.style.fontWeight = 'bold';
        else cell.style.fontWeight = 'normal';
        
        if (style.italic) cell.style.fontStyle = 'italic';
        else cell.style.fontStyle = 'normal';
        
        if (style.underline) cell.style.textDecoration = 'underline';
        else cell.style.textDecoration = 'none';
        
        if (style.textAlign) cell.style.textAlign = style.textAlign;
        if (style.fontSize) cell.style.fontSize = style.fontSize;
        if (style.color) cell.style.color = style.color;
        if (style.backgroundColor) cell.style.backgroundColor = style.backgroundColor;
    }

    insertRow() {
        if (!this.selectedCell) return;
        
        const row = parseInt(this.selectedCell.dataset.row);
        this.currentWorksheet.rows++;
        
        // Shift existing data
        const newData = {};
        for (const [cellId, cellInfo] of Object.entries(this.cellData)) {
            const [r, c] = cellId.split('-').map(Number);
            if (r >= row) {
                newData[`${r + 1}-${c}`] = cellInfo;
            } else {
                newData[cellId] = cellInfo;
            }
        }
        this.cellData = this.currentWorksheet.data = newData;
        
        this.generateTable(this.currentWorksheet.rows, this.currentWorksheet.cols);
        this.updateModified();
    }

    insertColumn() {
        if (!this.selectedCell) return;
        
        const col = parseInt(this.selectedCell.dataset.col);
        this.currentWorksheet.cols++;
        
        // Shift existing data
        const newData = {};
        for (const [cellId, cellInfo] of Object.entries(this.cellData)) {
            const [r, c] = cellId.split('-').map(Number);
            if (c >= col) {
                newData[`${r}-${c + 1}`] = cellInfo;
            } else {
                newData[cellId] = cellInfo;
            }
        }
        this.cellData = this.currentWorksheet.data = newData;
        
        this.generateTable(this.currentWorksheet.rows, this.currentWorksheet.cols);
        this.updateModified();
    }

    deleteRow() {
        if (!this.selectedCell || this.currentWorksheet.rows <= 1) return;
        
        const row = parseInt(this.selectedCell.dataset.row);
        this.currentWorksheet.rows--;
        
        // Remove and shift data
        const newData = {};
        for (const [cellId, cellInfo] of Object.entries(this.cellData)) {
            const [r, c] = cellId.split('-').map(Number);
            if (r < row) {
                newData[cellId] = cellInfo;
            } else if (r > row) {
                newData[`${r - 1}-${c}`] = cellInfo;
            }
            // Skip r === row (deleted)
        }
        this.cellData = this.currentWorksheet.data = newData;
        
        this.generateTable(this.currentWorksheet.rows, this.currentWorksheet.cols);
        this.updateModified();
    }

    deleteColumn() {
        if (!this.selectedCell || this.currentWorksheet.cols <= 1) return;
        
        const col = parseInt(this.selectedCell.dataset.col);
        this.currentWorksheet.cols--;
        
        // Remove and shift data
        const newData = {};
        for (const [cellId, cellInfo] of Object.entries(this.cellData)) {
            const [r, c] = cellId.split('-').map(Number);
            if (c < col) {
                newData[cellId] = cellInfo;
            } else if (c > col) {
                newData[`${r}-${c - 1}`] = cellInfo;
            }
            // Skip c === col (deleted)
        }
        this.cellData = this.currentWorksheet.data = newData;
        
        this.generateTable(this.currentWorksheet.rows, this.currentWorksheet.cols);
        this.updateModified();
    }

    applyFormula() {
        if (!this.selectedCell) return;
        
        const formula = document.getElementById('formulaInput').value;
        const cellId = this.selectedCell.dataset.cellId;
        
        if (!this.cellData[cellId]) {
            this.cellData[cellId] = {};
        }
        
        if (formula.startsWith('=')) {
            this.cellData[cellId].formula = formula;
            try {
                const result = this.evaluateFormula(formula);
                this.selectedCell.textContent = result;
                this.cellData[cellId].value = result;
            } catch (error) {
                this.selectedCell.textContent = '#ERROR';
                this.cellData[cellId].value = '#ERROR';
            }
        } else {
            this.selectedCell.textContent = formula;
            this.cellData[cellId].value = formula;
            this.cellData[cellId].formula = null;
        }
        
        this.updateModified();
    }

    updateWorksheetTitle() {
        if (this.currentWorksheet) {
            this.currentWorksheet.title = document.getElementById('worksheetTitle').value;
            this.updateWorksheetList();
            this.updateModified();
        }
    }

    updateModified() {
        if (this.currentWorksheet) {
            this.currentWorksheet.modified = new Date();
            this.updateInfo();
        }
    }

    updateInfo() {
        const cellCount = Object.keys(this.cellData).length;
        document.getElementById('cellCount').textContent = `${cellCount} cella`;
        
        if (this.currentWorksheet) {
            document.getElementById('lastModified').textContent = 
                `Módosítva: ${this.formatDate(this.currentWorksheet.modified)}`;
        }
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    showSaveModal() {
        document.getElementById('saveFileName').value = this.currentWorksheet.title;
        document.getElementById('saveModal').classList.add('show');
    }

    hideSaveModal() {
        document.getElementById('saveModal').classList.remove('show');
    }

    saveWorksheet() {
        const fileName = document.getElementById('saveFileName').value.trim();
        if (!fileName) return;
        
        const data = {
            worksheets: this.worksheets,
            currentWorksheetId: this.currentWorksheetId
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.hideSaveModal();
    }

    showLoadModal() {
        this.updateFileList();
        document.getElementById('loadModal').classList.add('show');
    }

    hideLoadModal() {
        document.getElementById('loadModal').classList.remove('show');
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = `
            <input type="file" id="fileInput" accept=".json" style="width: 100%; margin-bottom: 1rem;">
            <div style="color: #718096; font-size: 0.9rem;">
                Válassza ki a betöltendő JSON fájlt
            </div>
        `;
        
        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.loadWorksheetData(data);
                        this.hideLoadModal();
                    } catch (error) {
                        alert('Hibás fájl formátum!');
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    loadWorksheetData(data) {
        if (data.worksheets && Array.isArray(data.worksheets)) {
            this.worksheets = data.worksheets.map(ws => ({
                ...ws,
                created: new Date(ws.created),
                modified: new Date(ws.modified)
            }));
            this.currentWorksheetId = data.currentWorksheetId || this.worksheets.length;
            
            if (this.worksheets.length > 0) {
                this.switchToWorksheet(this.worksheets[0]);
                this.updateWorksheetList();
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WorksheetApp();
});