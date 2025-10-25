import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Layers,
  Ruler,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  Download,
  Loader2,
  Landmark,
  Search as SearchIcon,
} from "lucide-react";

import { MapContainer, TileLayer, GeoJSON, ScaleControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import html2canvas from "html2canvas";

import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import Legend from "../components/Legend";

const unescoIcon = new L.Icon({
  iconUrl: "/unesco.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

const cityIcon = new L.Icon({
  iconUrl: "/ciudad.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const glassHeader =
  "bg-neutral-900/80 backdrop-blur-md border-b border-white/10 shadow-lg";
const glassSidebar =
  "bg-neutral-900/90 backdrop-blur-md border-r border-white/10 shadow-xl";

// Fallback por tipo geométrico
const getLayerStyle = (layerType) => {
  switch (layerType) {
    case "Polygon":
    case "MultiPolygon":
      return { color: "rgba(16, 185, 129, 0.9)", weight: 1, fillOpacity: 0.25 };
    case "MultiLineString":
      return { color: "rgba(59, 130, 246, 0.9)", weight: 5 };
    default:
      return { color: "#ff0000", weight: 1 };
  }
};

// Estilo específico para BUFFER (id 5): rojo translúcido + borde oscuro
const BUFFER_STYLE = {
  color: "#1f2937",
  weight: 2,
  opacity: 1,
  fillColor: "#ef4444",
  fillOpacity: 0.35,
};

const pointToLayer = (feature, latlng, layerId) => {
  if (layerId === 1) return L.marker(latlng, { icon: unescoIcon });
  if (layerId === 2) return L.marker(latlng, { icon: cityIcon });
  return L.marker(latlng, { icon: markerIcon });
};

const onEachFeature = (feature, layer, layerId) => {
  if (!feature.properties) return;
  let propertiesHtml = "";
  const props = feature.properties;

  switch (layerId) {
    case 1: {
      const unescoName = props.name_es || "Sitio UNESCO";
      const unescoDesc = props.short_de_2 || "Sin descripción";
      const imgUrl =
        "https://i.postimg.cc/rmFZ8brc/Unesco-e1536752573673-800x400.jpg";
      propertiesHtml = `
        <div class="popup-unesco">
          <h4 class="popup-title">${unescoName}</h4>
          <p class="popup-desc">${unescoDesc}</p>
          <img src="${imgUrl}" alt="UNESCO" class="popup-img" loading="lazy" />
        </div>
      `;
      break;
    }
    case 2: {
      const cityName = props.ciudad || "Ciudad";
      const capitalInfo = props.capital || "N/A";
      propertiesHtml = `
        <h4 class="popup-title">${cityName}</h4>
        <ul class="popup-properties-list">
          <li><strong>Capital:</strong> ${capitalInfo}</li>
        </ul>
      `;
      break;
    }
    case 3: {
      const hydroName = props.nombre || "Hidrografía";
      propertiesHtml = `<h4 class="popup-title">${hydroName}</h4>`;
      break;
    }
    case 4: {
      const continentName = props.continent || "Continente";
      propertiesHtml = `<h4 class="popup-title">${continentName}</h4>`;
      break;
    }
    case 5: {
      const city = props.ciudad_nombre || "Ciudad";
      const pais = props.ciudad_pais || "N/A";
      const total = props.sitios_200km ?? 0;
      propertiesHtml = `
        <h4 class="popup-title">${city}</h4>
        <ul class="popup-properties-list">
          <li><strong>País:</strong> ${pais}</li>
          <li><strong>Sitios UNESCO en 200 km:</strong> ${total}</li>
        </ul>
      `;
      break;
    }
    case 6: {
      const cont = props.continente_nombre || "Continente";
      const n = props.n_sitios ?? 0;
      propertiesHtml = `
        <h4 class="popup-title">${cont}</h4>
        <ul class="popup-properties-list">
          <li><strong>Sitios UNESCO:</strong> ${n}</li>
        </ul>
      `;
      break;
    }
    default:
      propertiesHtml = `<h4 class="popup-title">Detalle</h4>`;
  }
  layer.bindPopup(propertiesHtml);
};

// ------------ Helpers de búsqueda -------------
const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const SEARCH_ZOOM = 7;

// === Guardar registro con texto y tipo ===
const saveRegistro = async (lng, lat, texto, tipo) => {
  try {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5001/api/registros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lng, lat, texto, tipo }),
    });
  } catch (e) {
    console.error("No se pudo guardar el registro de búsqueda:", e);
  }
};

export default function Visor() {
  const [layers, setLayers] = useState([]);
  const [layerVisibility, setLayerVisibility] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [layerData, setLayerData] = useState({});
  const [loadingLayerId, setLoadingLayerId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [map, setMap] = useState(null);

  // Buscador
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  // Filtro activo: solo dibujar estas features de la capa indicada
  const [activeFilter, setActiveFilter] = useState(null); // { layerId: 1|2, ids: Set<number> }

  useEffect(() => {
    if (!map) return;
    const t = setTimeout(() => map.invalidateSize(), 320);
    return () => clearTimeout(t);
  }, [sidebarOpen, map]);

  useEffect(() => {
    const fetchLayerList = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5001/api/layers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Error al cargar la lista de capas");
        const data = await response.json();
        setLayers(data);
        const initialVisibility = {};
        data.forEach((layer) => (initialVisibility[layer.id] = false));
        setLayerVisibility(initialVisibility);
      } catch (err) {
        console.error("Error al obtener lista de capas:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLayerList();
  }, []);

  const fetchLayerIfNeeded = async (layerId) => {
    if (layerData[layerId]) return layerData[layerId];
    try {
      setLoadingLayerId(layerId);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/layers/${layerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al cargar datos de la capa");
      }
      const data = await response.json();
      setLayerData((prev) => ({ ...prev, [layerId]: data.geojson_data }));
      return data.geojson_data;
    } finally {
      setLoadingLayerId(null);
    }
  };

  const handleVisibilityChange = async (layerId) => {
    const newVisibility = !layerVisibility[layerId];
    setLayerVisibility((prev) => ({ ...prev, [layerId]: newVisibility }));
    if (newVisibility && !layerData[layerId]) {
      try {
        await fetchLayerIfNeeded(layerId);
      } catch (err) {
        console.error(`Error al cargar datos de capa ${layerId}:`, err.message);
        alert(`No se pudieron cargar los datos de la capa: ${err.message}`);
        setLayerVisibility((prev) => ({ ...prev, [layerId]: false }));
      }
    }
  };

  const handleDownloadImage = async () => {
    if (!map) return;
    const container = map.getContainer();
    map.invalidateSize(true);
    map.setView(map.getCenter(), map.getZoom());
    await new Promise((r) => setTimeout(r, 300));
    try {
      const canvas = await html2canvas(container, {
        useCORS: true,
        backgroundColor: "#0a0a0a",
        scale: 2,
        ignoreElements: (el) =>
          typeof el.className === "string" &&
          el.className.includes("leaflet-control"),
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "mapa-geoleaf.png";
      a.click();
    } catch (e) {
      console.error("No se pudo exportar PNG:", e);
      alert("Hubo un error al descargar la imagen. Revisa la consola.");
    }
  };

  const center = [20, 0];

  const getLayerIcon = (layer) => {
    switch (layer.id) {
      case 1:
        return <Landmark className="h-4 w-4 text-yellow-400" />;
      case 2:
        return <MapPin className="h-4 w-4 text-orange-400" />;
      case 3:
        return <Ruler className="h-4 w-4 text-blue-400" />;
      case 4:
        return <Layers className="h-4 w-4 text-emerald-400" />;
      default:
        return <Layers className="h-4 w-4 text-neutral-400" />;
    }
  };

  // ---------- BÚSQUEDA EN VIVO ----------
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const [d1, d2] = await Promise.all([
          fetchLayerIfNeeded(1),
          fetchLayerIfNeeded(2),
        ]);

        const q = norm(searchQuery.trim());
        const results = [];

        const pushCandidate = (layerId, label, feature) => {
          const nl = norm(label);
          const idx = nl.indexOf(q);
          if (idx === -1) return;
          const priority = idx === 0 ? 0 : 1; // los que empiezan con q primero
          results.push({ layerId, label, feature, priority, len: label.length });
        };

        // UNESCO (name_es)
        for (const f of d1?.features ?? []) {
          const label = f?.properties?.name_es;
          if (label) pushCandidate(1, label, f);
        }
        // Ciudades (ciudad)
        for (const f of d2?.features ?? []) {
          const label = f?.properties?.ciudad;
          if (label) pushCandidate(2, label, f);
        }

        results.sort((a, b) => a.priority - b.priority || a.len - b.len);
        setSearchResults(results.slice(0, 20));
      } catch (err) {
        console.error("Error filtrando búsqueda:", err);
      } finally {
        setSearching(false);
      }
    }, 220);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Apaga todo menos layerId
  const showOnlyLayer = (layerId) => {
    setLayerVisibility((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => (next[k] = Number(k) === layerId));
      return next;
    });
  };

  const openTempPopup = (lat, lng, html) => {
    if (!map) return;
    map.setView([lat, lng], SEARCH_ZOOM, { animate: true });
    L.popup({ className: "search-popup", maxWidth: 360 })
      .setLatLng([lat, lng])
      .setContent(html)
      .openOn(map);
  };

  const goToItem = async (item) => {
    await fetchLayerIfNeeded(item.layerId);
    // mostrar solo esa capa
    showOnlyLayer(item.layerId);
    // filtrar solo a la feature seleccionada
    setActiveFilter({ layerId: item.layerId, ids: new Set([item.feature.id]) });

    const coords = item?.feature?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return;
    const [lng, lat] = coords;

    // === guardar registro con texto y tipo ===
    const tipo = item.layerId === 1 ? "unesco" : "ciudad";
    const texto = item.label;
    saveRegistro(lng, lat, texto, tipo);

    // Cerrar popups previos
    if (map) map.closePopup();

    // Popup según capa
    if (item.layerId === 1) {
      const p = item.feature.properties || {};
      const name = p.name_es || "Sitio UNESCO";
      const desc = p.short_de_2 || "Sin descripción";
      const imgUrl =
        "https://i.postimg.cc/rmFZ8brc/Unesco-e1536752573673-800x400.jpg";
      const html = `
        <div class="popup-unesco">
          <h4 class="popup-title">${name}</h4>
          <p class="popup-desc">${desc}</p>
          <img src="${imgUrl}" alt="UNESCO" class="popup-img" loading="lazy" />
        </div>
      `;
      openTempPopup(lat, lng, html);
    } else if (item.layerId === 2) {
      const p = item.feature.properties || {};
      const city = p.ciudad || "Ciudad";
      const capital = p.capital || "N/A";
      const html = `
        <h4 class="popup-title">${city}</h4>
        <ul class="popup-properties-list">
          <li><strong>Capital:</strong> ${capital}</li>
        </ul>
      `;
      openTempPopup(lat, lng, html);
    }

    setSearchResults([]);
  };

  // Enter: ir al primer resultado
  const onSubmitSearch = async (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      await goToItem(searchResults[0]);
    }
  };

  // GeoJSON filtrado si corresponde
  const dataForLayer = (layerId) => {
    const data = layerData[layerId];
    if (!data) return null;
    if (!activeFilter || activeFilter.layerId !== layerId) return data;
    const ids = activeFilter.ids;
    const feats = (data.features ?? []).filter((f) => ids.has(f.id));
    return { ...data, features: feats };
  };

  // Token para forzar remount de clusters/geojson cuando cambia el filtro
  const filterToken = (layerId) =>
    activeFilter?.layerId === layerId
      ? Array.from(activeFilter.ids).join("-")
      : "all";

  // listas separadas para el panel
  const baseLayersList = layers.filter((l) => l.id >= 1 && l.id <= 4);
  const consultasList = layers.filter((l) => l.id >= 5);

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-900 text-white">
      <header
        className={`flex items-center justify-between h-14 px-4 z-20 ${glassHeader}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            title={
              sidebarOpen ? "Ocultar panel de capas" : "Mostrar panel de capas"
            }
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5 text-neutral-300" />
            ) : (
              <PanelLeftOpen className="h-5 w-5 text-neutral-300" />
            )}
          </button>
          <div className="h-8 w-8 grid place-items-center rounded-lg bg-emerald-400/20 border border-emerald-300/50">
            <MapPin className="h-4 w-4 text-emerald-300" />
          </div>
          <h1 className="font-extrabold text-lg tracking-wider text-white">
            GeoLeaf <span className="text-emerald-400">Visor</span>
          </h1>
        </div>

        {/* Buscador */}
        <form onSubmit={onSubmitSearch} className="relative w-72 md:w-96">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ciudad o sitio UNESCO"
            className="w-full rounded-lg bg-neutral-800/80 border border-white/10 px-3 py-2 pr-9 outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            className="absolute right-1 top-1.5 p-1.5 rounded-md hover:bg-white/10"
            title="Buscar"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
            ) : (
              <SearchIcon className="h-4 w-4 text-neutral-300" />
            )}
          </button>

          {/* Resultados live */}
          {searchResults.length > 0 && (
            <div className="absolute mt-2 w-full max-h-64 overflow-auto bg-neutral-900/95 border border-white/10 rounded-lg shadow-xl z-30">
              {searchResults.map((item, idx) => (
                <button
                  key={`${item.layerId}-${idx}-${item.label}`}
                  onClick={() => goToItem(item)}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2"
                >
                  {item.layerId === 1 ? (
                    <Landmark className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <MapPin className="h-4 w-4 text-orange-400" />
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        <nav className="flex items-center space-x-3">
          <button
            onClick={handleDownloadImage}
            className="p-2 rounded-full hover:bg-white/10 transition"
            title="Descargar Imagen (PNG)"
          >
            <Download className="h-5 w-5 text-neutral-300" />
          </button>
          <Link
            to="/dashboard"
            className="p-2 rounded-full hover:bg-white/10 transition text-neutral-300"
            title="Volver al Dashboard"
          >
            <LogOut className="h-5 w-5" />
          </Link>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`${glassSidebar} z-10 p-4 ${
            sidebarOpen ? "w-64" : "w-0"
          } overflow-hidden transition-[width] duration-300`}
        >
          {sidebarOpen && (
            <div className="flex h-full flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-4 text-emerald-400">
                  Capas
                </h2>
                <div className="mb-4 text-xs text-neutral-400">
                  <p>Base: OpenStreetMap</p>
                  <p>SRID: EPSG:4326</p>
                </div>

                <nav className="space-y-3 text-sm">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando lista...
                    </div>
                  )}

                  {!isLoading && (
                    <>
                      {/* Capas base (1–4) */}
                      {baseLayersList.map((layer) => (
                        <label
                          key={layer.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2">
                            {getLayerIcon(layer)}
                            {layer.name}
                            {loadingLayerId === layer.id && (
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                            )}
                          </span>
                          <input
                            type="checkbox"
                            className="rounded text-emerald-400 bg-neutral-700 border-neutral-600 focus:ring-emerald-400"
                            checked={!!layerVisibility[layer.id]}
                            onChange={() => handleVisibilityChange(layer.id)}
                            disabled={loadingLayerId === layer.id}
                          />
                        </label>
                      ))}

                      {/* Consultas (vistas) */}
                      {consultasList.length > 0 && (
                        <>
                          <div className="border-t border-white/10 my-3" />
                          <h3 className="text-sm font-semibold text-emerald-400 mb-2">
                            Consultas
                          </h3>

                          {consultasList.map((layer) => (
                            <label
                              key={layer.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                            >
                              <span className="inline-flex items-center gap-2">
                                {getLayerIcon(layer)}
                                {layer.name}
                                {loadingLayerId === layer.id && (
                                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                                )}
                              </span>
                              <input
                                type="checkbox"
                                className="rounded text-emerald-400 bg-neutral-700 border-neutral-600 focus:ring-emerald-400"
                                checked={!!layerVisibility[layer.id]}
                                onChange={() => handleVisibilityChange(layer.id)}
                                disabled={loadingLayerId === layer.id}
                              />
                            </label>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </nav>
              </div>

              <div className="text-xs text-neutral-500 mt-4">
                <p>GeoLeaf v1.0 | Datos EPSG:4326</p>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={2}
            minZoom={2}
            className="absolute inset-0"
            zoomControl={false}
            ref={setMap}
            preferCanvas={true}
            maxBounds={[
              [-90, -180],
              [90, 180],
            ]}
          >
            <ScaleControl imperial={false} />
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              crossOrigin="anonymous"
            />

            {/* Sitios UNESCO (1) */}
            {layerVisibility[1] && dataForLayer(1) && (
              <MarkerClusterGroup key={`mcg-1-${filterToken(1)}`}>
                <GeoJSON
                  key={`geo-1-${filterToken(1)}`}
                  data={dataForLayer(1)}
                  pointToLayer={(feature, latlng) =>
                    pointToLayer(feature, latlng, 1)
                  }
                  onEachFeature={(feature, layer) =>
                    onEachFeature(feature, layer, 1)
                  }
                />
              </MarkerClusterGroup>
            )}

            {/* Ciudades (2) */}
            {layerVisibility[2] && dataForLayer(2) && (
              <MarkerClusterGroup key={`mcg-2-${filterToken(2)}`}>
                <GeoJSON
                  key={`geo-2-${filterToken(2)}`}
                  data={dataForLayer(2)}
                  pointToLayer={(feature, latlng) =>
                    pointToLayer(feature, latlng, 2)
                  }
                  onEachFeature={(feature, layer) =>
                    onEachFeature(feature, layer, 2)
                  }
                />
              </MarkerClusterGroup>
            )}

            {/* Resto de capas y consultas que no son Point */}
            {layers.map((layer) => {
              if (layer.type === "Point") return null;
              const data = layerData[layer.id];
              if (!layerVisibility[layer.id] || !data) return null;
              return (
                <GeoJSON
                  key={layer.id}
                  data={data}
                  style={() =>
                    layer.id === 5 ? BUFFER_STYLE : getLayerStyle(layer.type)
                  }
                  onEachFeature={(feature, layerInMap) =>
                    onEachFeature(feature, layerInMap, layer.id)
                  }
                />
              );
            })}
          </MapContainer>

          <div className="absolute bottom-4 right-4 z-[1000] text-white">
            <Legend layers={layers} />
          </div>

          {/* Toggle panel en pantallas pequeñas */}
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="absolute top-4 left-4 z-[1000] rounded-lg bg-neutral-900/80 border border-white/10 p-2 hover:bg-neutral-900 transition md:hidden"
            title={
              sidebarOpen ? "Ocultar panel de capas" : "Mostrar panel de capas"
            }
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5 text-white/80" />
            ) : (
              <PanelLeftOpen className="h-5 w-5 text-white/80" />
            )}
          </button>
        </main>
      </div>
    </div>
  );
}
