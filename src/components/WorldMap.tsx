import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type WorldMapProps = {
  onCountryClick: (countryName: string) => void;
  loading?: boolean;
};

const WorldMap: React.FC<WorldMapProps> = ({ onCountryClick, loading }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleCountryClick = (geo: any) => {
    const countryName = geo.properties.name;
    onCountryClick(countryName);
  };

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    setHoveredCountry(geo.properties.name);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
  };

  return (
    <Box data-testid="world-map" sx={{ position: "relative", width: "100vw", height: "100vh" }}>
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{
          scale: 100,
          center: [150, -90],
        }}
      >
        <ZoomableGroup zoom={1.0}>
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleCountryClick(geo)}
                  onMouseEnter={(event: React.MouseEvent) =>
                    handleMouseEnter(geo, event)
                  }
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      fill: "#D6D6DA",
                      outline: "none",
                      stroke: "#FFFFFF",
                      strokeWidth: 0.5,
                    },
                    hover: {
                      fill: "#F53",
                      outline: "none",
                      stroke: "#FFFFFF",
                      strokeWidth: 0.5,
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#E42",
                      outline: "none",
                      stroke: "#FFFFFF",
                      strokeWidth: 0.5,
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {hoveredCountry && (
        <Paper
          sx={{
            position: "fixed",
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
            padding: "8px 12px",
            pointerEvents: "none",
            zIndex: 1000,
            boxShadow: 3,
          }}
        >
          <Typography variant="body2">{hoveredCountry}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default WorldMap;
