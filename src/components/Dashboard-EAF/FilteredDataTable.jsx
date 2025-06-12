import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import moment from "moment";
import ComparisonDetail from "./ComparisonDetail";

const FilteredDataTable = () => {
  const filteredData = useSelector(
    (state) => state.hornos2.furnaceDataFiltered
  );
  const [selectedRow, setSelectedRow] = useState(null);

  // Añadir listener para el evento de limpiar selección de tabla
  useEffect(() => {
    const handleClearTableSelection = () => {
      setSelectedRow(null);
    };

    // Escuchar el evento personalizado de limpieza
    window.addEventListener("clearTableSelection", handleClearTableSelection);

    // Mantener el listener original para compatibilidad
    const handleResetFilters = () => {
      setSelectedRow(null);
    };
    window.addEventListener("resetFilters", handleResetFilters);

    // Limpieza al desmontar el componente
    return () => {
      window.removeEventListener(
        "clearTableSelection",
        handleClearTableSelection
      );
      window.removeEventListener("resetFilters", handleResetFilters);
    };
  }, []);

  // Función para calcular la mejora TAP13 igual que en ComparisonDetail.jsx
  const calcularMejoraTap13 = (row) => {
    try {
      const kwhOriginal = Number(row.kwh_tap4_original);
      const kwhOptimo = Number(row.kwh_tap4_optimo);

      // Verificar que los valores son válidos
      if (
        isNaN(kwhOriginal) ||
        isNaN(kwhOptimo) ||
        kwhOriginal === 0 ||
        row.kwh_tap4_original === undefined ||
        row.kwh_tap4_original === null ||
        row.kwh_tap4_optimo === undefined ||
        row.kwh_tap4_optimo === null
      ) {
        return null;
      }

      // Aplicar la misma fórmula que ComparisonDetail.jsx
      const porcentajeMejoraTap =
        ((kwhOriginal - kwhOptimo) / kwhOriginal) * 100;

      return porcentajeMejoraTap;
    } catch (error) {
      console.error("Error al calcular mejora TAP13:", error);
      return null;
    }
  };

  const formatDate = (dateString) => {
    // Verificar si la fecha es válida
    if (!dateString) return "-";

    // Verificar si la fecha está en formato de número serial de Excel
    if (typeof dateString === "number") {
      // Convertir número serial de Excel a fecha JavaScript
      // Excel usa días desde 30/12/1899, y JavaScript desde 01/01/1970
      const excelEpoch = new Date(1899, 11, 30);
      const msPerDay = 24 * 60 * 60 * 1000;
      const excelDate = new Date(excelEpoch.getTime() + dateString * msPerDay);
      return moment(excelDate).format("DD/MM/YYYY HH:mm:ss");
    }

    // Intentar parsear como fecha normal
    const parsedDate = moment(dateString);

    // Verificar si la fecha es válida
    if (parsedDate.isValid()) {
      return parsedDate.format("DD/MM/YYYY HH:mm:ss");
    }

    // Si no es un formato válido, devolver el valor original
    return dateString;
  };

  // Función para seleccionar una fila
  // eslint-disable-next-line no-unused-vars
  const handleRowSelect = (row, index) => {
    // Si la fila ya está seleccionada, la deseleccionamos
    if (selectedRow && selectedRow.colada === row.colada) {
      setSelectedRow(null);
    } else {
      setSelectedRow(row);
    }
  };

  if (!filteredData || filteredData.length === 0) {
    return (
      <Card sx={{ margin: 2, padding: 2 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No hay datos disponibles con los filtros seleccionados
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ margin: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Resultados de la búsqueda</Typography>
            <Chip
              label={`${filteredData.length} coladas encontradas`}
              color="primary"
              variant="outlined"
            />
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader aria-label="tabla de datos filtrados">
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    <strong>N° Colada</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Fecha</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Grado</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Familia</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Consumo Energético Total (kWh)</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Temp. Real (°C)</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Temp. Pred. (°C)</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Temp. Opt. (°C)</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Mejora del Consumo Energético TAP13 (%)</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((row, index) => {
                  // Calcular la mejora TAP13 para esta fila
                  const mejoraTap13 = calcularMejoraTap13(row);

                  return (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                        backgroundColor:
                          selectedRow && selectedRow.colada === row.colada
                            ? "rgba(0, 32, 208, 0.08)"
                            : "inherit",
                        cursor: "pointer",
                      }}
                      onClick={() => handleRowSelect(row, index)}
                    >
                      <TableCell align="center">{row.colada || "-"}</TableCell>
                      <TableCell align="center">
                        {formatDate(row.fecha_colada) || "-"}
                      </TableCell>
                      <TableCell align="center">
                        {row.grado_acero || "-"}
                      </TableCell>
                      <TableCell align="center">{row.familia || "-"}</TableCell>
                      <TableCell align="center">
                        {row.kwh_total ? row.kwh_total.toLocaleString() : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {row.y_original ? row.y_original.toFixed(1) : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {row.y_pred_original
                          ? row.y_pred_original.toFixed(1)
                          : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {row.y_pred_optimo ? row.y_pred_optimo.toFixed(1) : "-"}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          color:
                            mejoraTap13 !== null
                              ? mejoraTap13 > 0
                                ? "green"
                                : mejoraTap13 < 0
                                ? "red"
                                : "inherit"
                              : "inherit",
                          fontWeight:
                            mejoraTap13 !== null && mejoraTap13 !== 0
                              ? "bold"
                              : "normal",
                        }}
                      >
                        {mejoraTap13 !== null
                          ? mejoraTap13.toFixed(2) + ""
                          : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Mostrar detalles comparativos si hay una fila seleccionada */}
      {selectedRow && <ComparisonDetail selectedRow={selectedRow} />}
    </>
  );
};

export default FilteredDataTable;
