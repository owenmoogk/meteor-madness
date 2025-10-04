# Asteroid Impact Simulator

An interactive web application for visualizing near-Earth object (NEO) impacts and deflection strategies with real-time physics calculations.

![Asteroid Impact Simulator](https://img.shields.io/badge/status-MVP-blue)

## 🚀 Features

### Core Functionality
- **3D Trajectory Visualization**: Interactive Three.js-powered view showing asteroid approach paths, Earth, Sun, and optional Moon
- **2D Impact Map**: MapLibre-based map displaying impact zones with configurable blast rings
- **Real-time Physics**: All impact calculations performed client-side with instant updates
- **Deflection Simulation**: Model asteroid deflection with adjustable Δv and lead time
- **Interactive Controls**: Responsive sliders for all parameters with live preview

### Impact Metrics Calculated
- Kinetic energy (Joules & Megatons TNT equivalent)
- Crater diameter and depth
- Thermal radiation radius (flash burns)
- Overpressure zones (1, 3, 5, 10 PSI)
- Tsunami coastal reach (for ocean impacts)
- Seismic magnitude (Richter scale)

## 🛠️ Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Three.js (3D graphics)
- MapLibre GL (mapping)
- Zustand (state management)
- Tailwind CSS + shadcn/ui (styling)

**Physics Engine**
- Pure TypeScript implementation
- No external dependencies for calculations
- Based on simplified but scientifically reasonable models

## 🎮 Usage

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:8080`

### Controls

**Deflection Settings**
- **Asteroid Diameter** (50-2000 m): Size of the impactor
- **Density** (1500-3500 kg/m³): Material density (rocky vs metallic)
- **Impact Velocity** (5-30 km/s): Speed at Earth encounter
- **Impact Angle** (15-90°): Trajectory angle relative to surface
- **Deflection Δv** (0-5 mm/s): Velocity change applied to asteroid
- **Lead Time** (0-5 years): Time before impact when deflection occurs

**Visualization Settings**
- Toggle blast effect rings (crater, thermal, overpressure, tsunami)
- Toggle ocean/land impact mode
- Show/hide Sun and Moon in 3D view

**3D View Interactions**
- **Drag**: Rotate camera view
- **Scroll**: Zoom in/out
- **Auto-rotation**: Asteroid animates along trajectory

**2D Map Interactions**
- **Drag**: Pan map
- **Scroll**: Zoom map
- **Auto-center**: Map centers on impact point

## 📊 Physics Models (MVP)

### Assumptions & Simplifications

All physics calculations are **simplified educational models** suitable for a hackathon MVP:

**Mass Calculation**
```
m = ρ · (4/3) · π · r³
```

**Kinetic Energy**
```
E = 0.5 · m · v²
```

**Crater Scaling**
```
D_f [km] ≈ 0.01 · (E_k)^0.294 · sin^(1/3)(θ)
Depth ≈ 0.2 · D_f
```
- Based on empirical impact crater scaling laws
- Angle factor accounts for oblique impacts
- Constants calibrated for competent rock targets

**Overpressure Radii**
```
r_psi [km] = a(psi) · Y_mt^0.33
```
- Simplified from nuclear blast data
- Provides 1, 3, 5, 10 PSI contours
- Does not account for terrain or atmospheric effects

**Thermal Radius**
```
r_thermal [km] = 7 · Y_mt^0.4
```
- Approximates second-degree burn radius
- Direct line-of-sight radiation model
- Does not model atmospheric absorption

**Tsunami Reach** (ocean impacts only)
```
r_tsunami ≈ 0.8 · (0.2 · E_k)^0.25
```
- Very rough approximation for coastal inundation
- Assumes 20% energy coupling to water
- Does not model bathymetry or coastline geometry

**Deflection Displacement**
```
Δs ≈ Δv · T
```
- Simple along-track miss distance
- First-order linear approximation
- Actual orbital mechanics more complex

### Known Limitations

⚠️ **These models are educational approximations**:
- No atmospheric entry modeling (assumes no breakup/airburst)
- No terrain effects on blast propagation
- Simplified crater formation (real impacts highly variable)
- Tsunami model is order-of-magnitude only
- Deflection assumes impulsive maneuver (real missions more complex)
- Population/casualty estimates not implemented (placeholder only)

For mission-critical analysis, use validated tools like:
- JPL Sentry
- ESA NEOCC
- NEOSim
- iSALE impact simulator

## 🎨 Design System

**Color Palette**
- Background: Deep space dark (`hsl(220 25% 6%)`)
- Primary accent: Cyan (`hsl(190 100% 50%)`)
- Warning: Orange (`hsl(38 92% 50%)`)
- Destructive: Red (`hsl(0 75% 55%)`)

**Visual Effects**
- Glow effects on interactive elements
- Gradient overlays for depth
- Backdrop blur for glass morphism
- Smooth transitions and animations

## 🏗️ Architecture

```
src/
├── components/
│   ├── ThreeTrajectory.tsx    # 3D visualization
│   ├── ImpactMap.tsx           # 2D map with rings
│   ├── ControlsPanel.tsx       # Input sliders
│   └── MetricsPanel.tsx        # Results display
├── lib/
│   └── physics.ts              # All calculations
├── state/
│   └── useSimStore.ts          # Zustand store
└── pages/
    └── Index.tsx               # Main layout
```

## 🔮 Future Enhancements

**Phase 2** (post-hackathon)
- [ ] NASA NEO API integration for real asteroids
- [ ] Backend with FastAPI for complex calculations
- [ ] Population density overlay for casualty estimates
- [ ] More deflection methods (kinetic impactor, gravity tractor)
- [ ] Historical impact database (Tunguska, Chelyabinsk, etc.)
- [ ] Export/share scenarios (URL encoding)

**Phase 3** (research-grade)
- [ ] Atmospheric entry modeling (airburst simulation)
- [ ] Higher-fidelity crater scaling (separate models for rock/sediment/ocean)
- [ ] CFD-based blast propagation
- [ ] Advanced tsunami modeling (bathymetry integration)
- [ ] Orbital propagation with perturbations
- [ ] Uncertainty quantification (Monte Carlo)

## 📚 References

**Impact Physics**
- Collins et al. (2005) - Earth Impact Effects Program
- Holsapple & Housen (2007) - Impact crater scaling
- Toon et al. (1997) - Environmental effects of impacts

**Deflection**
- NASA DART Mission results
- ESA Hera Mission design
- National Academy "Defending Planet Earth" report

**Data Sources**
- NASA NEO Program: https://cneos.jpl.nasa.gov/
- Minor Planet Center: https://www.minorplanetcenter.net/
- ESA NEOCC: https://neo.ssa.esa.int/

## 📝 License

MIT License - feel free to use for educational purposes

## 🙏 Acknowledgments

Built for hackathon demonstration of planetary defense concepts. Not for operational use.

---

**Note**: This simulator is designed for educational and outreach purposes. For actual planetary defense planning, consult with space agencies and use validated impact assessment tools.
