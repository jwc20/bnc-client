import {useCanvas} from "../../hooks/useCanvas.js";
import {GameBoardSystem} from "../../lib/GameBoardSystem.js";
import {useEffect, useRef} from "react";

interface BoardCanvasProps {
    width?: string | number;
    height?: string | number;
    [key: string]: unknown;
}

const BoardCanvas = (props: BoardCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const {canvasRef} = useCanvas({
        onInit: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
            return new GameBoardSystem(canvas, ctx, {
                gridSize: 100,
            });
        },

        onDraw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gridSystem: GameBoardSystem) => {
            gridSystem.draw(ctx);
        },

        onResize: (canvas: HTMLCanvasElement, gridSystem: GameBoardSystem) => {
            if (gridSystem) {
                gridSystem.resize(canvas);
            }
        },
    });

    // Calculate minimum width for the board
    const calculateMinimumWidth = () => {
        const rowHeight = 60;
        const pegRadius = rowHeight * 0.25;
        const feedbackPegRadius = pegRadius * 0.35;
        const feedbackBoxWidth = feedbackPegRadius * 6;
        const numberBoxWidth = 40;
        const sectionSpacing = 30 * 2;
        const padding = 20 * 2;
        const pegsAreaWidth = pegRadius * 2 * 1.8 * 4; // 4 pegs with spacing
        
        const totalBoardWidth = numberBoxWidth + sectionSpacing + pegsAreaWidth + feedbackBoxWidth + padding;
        const minimumCanvasWidth = totalBoardWidth / 0.4; // Board is 40% of canvas width
        
        return Math.max(minimumCanvasWidth, 600); // Ensure at least 600px minimum
    };

    useEffect(() => {
        const updateCanvasSize = () => {
            const container = containerRef.current;
            const canvas = canvasRef.current as HTMLCanvasElement | null;
            
            if (container && canvas) {
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                const minWidth = calculateMinimumWidth();
                
                // Set canvas width to container width, but not less than minimum
                const canvasWidth = Math.max(containerWidth, minWidth);
                const canvasHeight = containerHeight || 800;
                
                // Update canvas dimensions
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                
                // Update canvas style
                canvas.style.width = `${canvasWidth}px`;
                canvas.style.height = `${canvasHeight}px`;
                
                // Trigger resize if system exists
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Reinitialize the system with new dimensions
                    const system = new GameBoardSystem(canvas, ctx, {
                        gridSize: 100,
                    });
                    system.resize(canvas);
                }
            }
        };

        updateCanvasSize();
        
        const resizeObserver = new ResizeObserver(updateCanvasSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [canvasRef]);

    return (
        <div 
            ref={containerRef}
            style={{
                width: '100%',
                height: props.height || '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: `${calculateMinimumWidth()}px`,
            }}
        >
            <canvas
                ref={canvasRef as React.Ref<HTMLCanvasElement>}
                className="boardCanvas"
                style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto',
                }}
                {...props}
            />
        </div>
    );
};

export default BoardCanvas;
