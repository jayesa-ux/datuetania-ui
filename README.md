# DATUETANIA

DATUETANIA is a data visualization application for industrial furnace optimization. The application provides data analysis, charts, and actionable insights for two types of furnaces, enabling better decision-making for energy efficiency and optimization.

## Overview

This application manages and visualizes data from two types of industrial furnaces. It provides various dashboards with interactive charts and tables that display operational data, temperature readings, energy consumption metrics, and optimization opportunities.

### Main Features

- **Home Dashboard**: Selection interface for two furnace types
- **Hornos Tipo 1 (Type 1 Furnaces)**:
  - Individual furnace selection
  - Temperature and time slope analysis
  - Optimization comparison charts
  - Filterable data tables
- **Hornos Tipo 2 (Type 2 Furnaces)**:
  - Temperature scatter plots
  - Energy consumption (kWh) analysis
  - Consumption distribution comparison
  - Detailed optimization improvement metrics

## Technologies Used

- **Frontend**:
  - React.js (v18.3.1)
  - React Router (v7.1.3)
  - Material UI (v5.16.11)
  - Redux & React Redux (with RTK)
  - Echarts (data visualization)
- **Build Tools**:

  - Vite
  - ESLint

- **Data Handling**:
  - XLSX for Excel file processing
  - PapaParse for CSV data handling
  - Moment.js and date-fns for date manipulation
  - Lodash for data transformation

## Project Structure

```
datuetania-ui/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── dashboard1/  # Components for Type 1 furnace dashboard
│   │   ├── dashboard2/  # Components for Type 2 furnace dashboard
│   │   └── layout/      # App layout components (Navbar, Footer)
│   ├── config/        # Configuration files
│   ├── pages/         # Main page components
│   ├── redux/         # Redux store and slices
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
└── assets/
    ├── data/          # Data files (Excel, CSV)
    └── images/        # Image assets
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://gitlab.com/datuetan/datuetan-front.git
   cd datuetan-front
   ```

2. Install dependencies:

   ```
   npm install
   ```

   or

   ```
   yarn
   ```

3. Start the development server:

   ```
   npm run dev
   ```

   or

   ```
   yarn dev
   ```

4. Open your browser and navigate to: `http://localhost:5173`

### Building for Production

To build the application for production:

```
npm run build
```

or

```
yarn build
```

The build output will be in the `dist` directory.

## Data Files

The application expects certain data files to be present in the `public/assets/data/` directory:

- For Type 1 Furnaces:

  - `optimizations_hp{0-7}.xlsx`: Optimization data for each furnace
  - `HPITVARIABLESMES2023-2024.csv`: Variables data for furnaces

- For Type 2 Furnaces:
  - `opt_EAF_total2.xlsx`: Optimization data for Type 2 furnaces

## Features in Detail

### Type 1 Furnaces (Hornos Tipo 1)

- **Furnace Selection**: Grid of furnaces (0-7) to select
- **Dashboard**:
  - Filter panel for date ranges, steel grades, and optimization metrics
  - Data table showing historical time periods and consumption
  - Line chart comparing original measurements vs predictions vs optimizations
  - Metrics showing estimated improvements

### Type 2 Furnaces (Hornos Tipo 2)

- **Dashboard**:
  - Filter panel for batches, steel grades, families, and dates
  - Data table of filtered results with selectable rows for detailed view
  - Temperature scatter chart comparing real, predicted, and optimized values
  - kWh scatter chart comparing real vs optimal energy consumption
  - Improvement bar chart showing percentage improvements across batches
  - Consumption distribution chart comparing operator vs model distribution

## Contributing

1. Create your feature branch (`git checkout -b feature/your-feature`)
2. Commit your changes (`git commit -m 'Add some feature'`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Create a new Merge Request

## Project Status

Active development.

## License

Proprietary - All rights reserved.
