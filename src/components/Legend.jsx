
import React from 'react';
import { Layers, Minus, Square } from 'lucide-react';

const glassLegend = "bg-neutral-900/90 backdrop-blur-md border border-white/10 shadow-xl";

const getLegendIcon = (layer) => {
    switch (layer.id) {
        case 1:
            return <img src="/unesco.png" alt="Icono Sitios Unesco" className="h-5 w-5" />;

        case 2:
            return <img src="/ciudad.png" alt="Icono Ciudades del Mundo" className="h-5 w-5" />;

        case 3:
            return <Minus className="h-5 w-5 text-blue-400" />;

        case 4:
            return <Square className="h-5 w-5 text-emerald-400" />;

        default:
            return <Layers className="h-5 w-5 text-neutral-400" />;
    }
};

export default function Legend({ layers }) {

    if (!layers || layers.length === 0) {
        return null;
    }

    return (
        <div className={`p-4 rounded-lg w-56 ${glassLegend}`}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-3">
                <Layers className="h-4 w-4" />
                Leyenda
            </h3>

            <div className="space-y-2 text-sm text-neutral-200">
                {layers.map(layer => (
                    <div key={layer.id} className="flex items-center gap-3">

                        {getLegendIcon(layer)}

                        <span>{layer.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}