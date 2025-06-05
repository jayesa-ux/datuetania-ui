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

  // Añadir un listener para el evento de reset de filtros
  useEffect(() => {
    const handleResetFilters = () => {
      setSelectedRow(null);
    };

    window.addEventListener("resetFilters", handleResetFilters);

    // Limpieza al desmontar el componente
    return () => {
      window.removeEventListener("resetFilters", handleResetFilters);
    };
  }, []);

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
                    <strong>kWh Total</strong>
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
                    <strong>Mejora (kWh)</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((row, index) => (
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
                          row.mejora_kwh > 0
                            ? "green"
                            : row.mejora_kwh < 0
                            ? "red"
                            : "inherit",
                        fontWeight: row.mejora_kwh ? "bold" : "normal",
                      }}
                    >
                      {row.mejora_kwh ? row.mejora_kwh.toFixed(1) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
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
