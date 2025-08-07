import {useCanvas} from "../../hooks/useCanvas.js";
import {GridSystem} from "../../lib/GridSystem.ts";

const BoardCanvas = (props) => {
    const {canvasRef} = useCanvas({
        onInit: (canvas, ctx) => {
            return new GridSystem(canvas, ctx, {
                gridSize: 50,
            });
        },

        onDraw: (ctx, canvas, gridSystem) => {
            gridSystem.draw(ctx);
        },

        onResize: (canvas, gridSystem) => {
            if (gridSystem) {
                gridSystem.resize(canvas);
            }
        },
    });

    return (
        <canvas
            ref={canvasRef}
            className="boardCanvas"
            style={{
                boxSizing: 'content-box',
                minInlineSize: '60ch',
                maxInlineSize: '60ch',
                marginInline: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                // width: "50vw",
                height: "70vh",
                position: "inherit",
                top: 0,
                left: 0,
                zIndex: -1,
                background: "blue",
            }}
            {...props}
        />
    );
};


export default BoardCanvas;
