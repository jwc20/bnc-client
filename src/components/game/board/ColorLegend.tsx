type Color = { color: string; value?: string; label?: string };

type ColorLegendProps = {
    colors: Color[];
    gameState: { config: { num_of_colors: number } };
};

export const ColorLegend = ({ colors, gameState }: ColorLegendProps) => {
    const numOfColors = gameState.config.num_of_colors;
    const availableColors = colors.slice(0, numOfColors);
    
    return (
        <div className="color-legend">
            <div className="legend-title">Color Codes</div>
            <div className="legend-items">
                {availableColors.map((color: Color, index: number) => (
                    <div key={color.value} className="legend-item">
                        <div 
                            className="legend-color-peg" 
                            style={{backgroundColor: color.color}}
                        ></div>
                        <span className="legend-code">:{index + 1}</span>
                    </div>
                ))}
            </div>
            <style>{style}</style>
        </div>
    );
};

const style = `
    .color-legend {
        border: 2px solid #000;
        padding: 16px;
        width: 120px;
    }


    .color-legend {
        border: 2px solid #000;
        padding: 16px;
        background: white;
        width: 120px;
    }

    .legend-title {
        font-size: 0.4rem;
        margin-bottom: 12px;
        text-align: center;
        border-bottom: 1px solid #ccc;
        padding-bottom: 8px;
    }

    .legend-items {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    .legend-color-peg {
        width: 20px;
        height: 20px;
        border: 2px solid #000;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .legend-code {
        font-size: 0.5rem;
        font-weight: 500;
        min-width: 20px;
    }
`