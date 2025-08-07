export class GameBoardSystem {
    #ctx;
    #width;
    #height;
    #numberOfRows;
    #numberOfColorPegs;
    #numberOfColors;
    #pegRadius;
    #feedbackPegRadius;
    #rowHeight;
    #secretCodeHeight;
    #board = [];
    #currentRow = 0;

    // Layout constants
    #BOARD_WIDTH_RATIO = 0.4; // Board takes 25% of canvas width (narrower)
    #ROW_HEIGHT = 60; // Fixed row height
    #SECRET_CODE_HEIGHT = 80; // Fixed secret code area height
    #PADDING = 20; // Padding around elements
    #SECTION_SPACING = 30; // Spacing between sections (row number, pegs, feedback)
    #PEG_SPACING_RATIO = 1.8; // Spacing between pegs relative to peg diameter

    constructor(canvas, ctx, options = {}) {
        this.#ctx = ctx;
        this.canvas = canvas;

        // Game configuration
        this.#numberOfRows = options.numberOfRows || 10;
        this.#numberOfColorPegs = options.lengthOfCode || 4;
        this.#numberOfColors = options.numberOfColors || 6;

        // Calculate dimensions
        this.#calculateDimensions();

        // Initialize board state
        this.#initializeBoard();

        // Setup event handlers
        this.#setupEventHandlers();
    }

    #calculateDimensions() {
        // Canvas dimensions
        this.#width = Math.min(this.canvas.width, 900);
        this.#height = Math.max(this.canvas.height, 800);

        // Row and peg dimensions
        this.#rowHeight = this.#ROW_HEIGHT;
        this.#secretCodeHeight = this.#SECRET_CODE_HEIGHT;
        this.#pegRadius = this.#rowHeight * 0.25;
        this.#feedbackPegRadius = this.#pegRadius * 0.35;
    }

    #initializeBoard() {
        this.#board = [];
        for (let i = 0; i < this.#numberOfRows; i++) {
            this.#board.push({
                pegs: new Array(this.#numberOfColorPegs).fill(-1),
                feedback: new Array(4).fill(-1)
            });
        }
    }

    #setupEventHandlers() {
        // Store bound methods as instance properties
        this.boundHandleClick = this.#handleClick.bind(this);
        this.boundHandleHover = this.#handleHover.bind(this);
        this.canvas.addEventListener('click', this.boundHandleClick);
        this.canvas.addEventListener('mousemove', this.boundHandleHover);
    }

    #getBoardDimensions() {
        const boardWidth = this.#width * this.#BOARD_WIDTH_RATIO;
        const boardHeight = this.#secretCodeHeight + (this.#numberOfRows * this.#rowHeight) + this.#PADDING * 2;
        const boardX = (this.#width - boardWidth) / 2;
        const boardY = this.#PADDING;

        return { boardX, boardY, boardWidth, boardHeight };
    }

    #getRowSections(rowIndex) {
        const { boardX, boardY, boardWidth } = this.#getBoardDimensions();
        const rowY = boardY + this.#secretCodeHeight + (rowIndex * this.#rowHeight);

        // Divide row into three sections with spacing
        const numberBoxWidth = 40;
        const feedbackBoxWidth = this.#feedbackPegRadius * 6;
        const pegsAreaWidth = boardWidth - numberBoxWidth - feedbackBoxWidth - (this.#SECTION_SPACING * 2);

        return {
            numberBox: {
                x: boardX + this.#PADDING,
                y: rowY + this.#rowHeight / 2,
                width: numberBoxWidth
            },
            pegsArea: {
                x: boardX + this.#PADDING + numberBoxWidth + this.#SECTION_SPACING,
                y: rowY + this.#rowHeight / 2,
                width: pegsAreaWidth
            },
            feedbackBox: {
                x: boardX + boardWidth - this.#PADDING - feedbackBoxWidth,
                y: rowY + this.#rowHeight / 2,
                width: feedbackBoxWidth
            }
        };
    }

    #getPegPosition(rowIndex, pegIndex) {
        const sections = this.#getRowSections(rowIndex);
        const pegTotalSpacing = this.#pegRadius * 2 * this.#PEG_SPACING_RATIO;
        const totalPegsWidth = pegTotalSpacing * this.#numberOfColorPegs;
        const startX = sections.pegsArea.x + (sections.pegsArea.width - totalPegsWidth) / 2 + this.#pegRadius;

        const x = startX + (pegIndex * pegTotalSpacing);
        const y = sections.pegsArea.y;

        return { x, y };
    }

    #getSecretCodePegPosition(pegIndex) {
        const { boardX, boardY, boardWidth } = this.#getBoardDimensions();
        const pegTotalSpacing = this.#pegRadius * 2 * this.#PEG_SPACING_RATIO;
        const totalPegsWidth = pegTotalSpacing * this.#numberOfColorPegs;
        const startX = boardX + (boardWidth - totalPegsWidth) / 2 + this.#pegRadius;

        const x = startX + (pegIndex * pegTotalSpacing);
        const y = boardY + this.#secretCodeHeight / 2;

        return { x, y };
    }

    #handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check clicks on current row pegs
        for (let pegIndex = 0; pegIndex < this.#numberOfColorPegs; pegIndex++) {
            const pos = this.#getPegPosition(this.#currentRow, pegIndex);
            const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));

            if (distance <= this.#pegRadius) {
                const current = this.#board[this.#currentRow].pegs[pegIndex];
                this.#board[this.#currentRow].pegs[pegIndex] = (current + 1) % this.#numberOfColors;
                this.draw(this.#ctx);
                break;
            }
        }
    }

    #handleHover(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        let hovering = false;
        for (let pegIndex = 0; pegIndex < this.#numberOfColorPegs; pegIndex++) {
            const pos = this.#getPegPosition(this.#currentRow, pegIndex);
            const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));

            if (distance <= this.#pegRadius) {
                hovering = true;
                break;
            }
        }

        this.canvas.style.cursor = hovering ? 'pointer' : 'default';
    }

    #drawCircle(x, y, radius, filled = false) {
        this.#ctx.beginPath();
        this.#ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (filled) {
            this.#ctx.fill();
        } else {
            this.#ctx.stroke();
        }
    }

    #drawSecretCodeArea() {
        const { boardX, boardY, boardWidth } = this.#getBoardDimensions();

        // Draw secret code box with inner padding
        const innerPadding = 10;
        this.#ctx.strokeRect(
            boardX + innerPadding,
            boardY + innerPadding,
            boardWidth - innerPadding * 2,
            this.#secretCodeHeight - innerPadding * 2
        );

        // Draw secret code pegs with proper spacing
        for (let i = 0; i < this.#numberOfColorPegs; i++) {
            const pos = this.#getSecretCodePegPosition(i);
            this.#drawCircle(pos.x, pos.y, this.#pegRadius, false);
        }
    }

    #drawRow(rowIndex) {
        const { boardX, boardY, boardWidth } = this.#getBoardDimensions();
        const rowY = boardY + this.#secretCodeHeight + (rowIndex * this.#rowHeight);
        const sections = this.#getRowSections(rowIndex);

        // Draw row separator
        this.#ctx.beginPath();
        this.#ctx.moveTo(boardX, rowY);
        this.#ctx.lineTo(boardX + boardWidth, rowY);
        this.#ctx.stroke();

        // Draw row number with proper spacing
        const numberBoxSize = 30;
        this.#ctx.strokeRect(
            sections.numberBox.x - numberBoxSize/2,
            sections.numberBox.y - numberBoxSize/2,
            numberBoxSize,
            numberBoxSize
        );
        this.#ctx.font = "16px Arial";
        this.#ctx.textAlign = "center";
        this.#ctx.textBaseline = "middle";
        this.#ctx.fillText((this.#numberOfRows - rowIndex).toString(), sections.numberBox.x, sections.numberBox.y);

        // Draw color pegs with spacing
        for (let i = 0; i < this.#numberOfColorPegs; i++) {
            const pos = this.#getPegPosition(rowIndex, i);
            this.#drawCircle(pos.x, pos.y, this.#pegRadius, false);

            // Show selected color index
            const colorIndex = this.#board[rowIndex].pegs[i];
            if (colorIndex >= 0) {
                this.#ctx.font = "14px Arial";
                this.#ctx.textAlign = "center";
                this.#ctx.textBaseline = "middle";
                this.#ctx.fillText(colorIndex.toString(), pos.x, pos.y);
            }
        }

        // Draw feedback area with proper spacing
        this.#drawFeedbackArea(rowIndex);
    }

    #drawFeedbackArea(rowIndex) {
        const sections = this.#getRowSections(rowIndex);
        const feedbackX = sections.feedbackBox.x + sections.feedbackBox.width / 2;
        const centerY = sections.feedbackBox.y;

        // Draw feedback box
        const boxSize = this.#feedbackPegRadius * 5;
        this.#ctx.strokeRect(
            feedbackX - boxSize/2,
            centerY - boxSize/2,
            boxSize,
            boxSize
        );

        // Draw 2x2 feedback pegs with spacing
        const spacing = this.#feedbackPegRadius * 2.2;
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const x = feedbackX - spacing/2 + col * spacing;
                const y = centerY - spacing/2 + row * spacing;
                this.#drawCircle(x, y, this.#feedbackPegRadius, false);
            }
        }
    }

    draw(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, this.#width, this.#height);

        // Set drawing styles
        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#000";
        ctx.lineWidth = 1;

        // Get board dimensions
        const { boardX, boardY, boardWidth, boardHeight } = this.#getBoardDimensions();

        // Draw board border
        ctx.strokeRect(boardX, boardY, boardWidth, boardHeight);

        // Draw secret code area
        this.#drawSecretCodeArea();

        // Draw all rows
        for (let i = 0; i < this.#numberOfRows; i++) {
            this.#drawRow(i);
        }
    }

    resize(canvas) {
        this.#calculateDimensions();
        this.draw(this.#ctx);
    }

    update() {
        return true;
    }

    // Public methods
    setCurrentRow(rowIndex) {
        if (rowIndex >= 0 && rowIndex < this.#numberOfRows) {
            this.#currentRow = rowIndex;
        }
    }

    getCurrentRow() {
        return this.#currentRow;
    }

    getBoard() {
        return this.#board;
    }

    getRequiredHeight() {
        return this.#secretCodeHeight + (this.#numberOfRows * this.#rowHeight) + this.#PADDING * 2;
    }

    destroy() {
        this.canvas.removeEventListener('click', this.#handleClick);
        this.canvas.removeEventListener('mousemove', this.#handleHover);
    }
}