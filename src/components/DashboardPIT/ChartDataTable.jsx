import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { setChartFurnace } from "../../redux/furnaceSlice";
import moment from "moment";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";

const ChartDataTable = () => {
  const furnaceDataFiltered = useSelector(
    (state) => state.furnace.furnaceDataFiltered
  );
  const selectedChartFurnace = useSelector(
    (state) => state.furnace.selectedChartFurnace
  );
  const dispatch = useDispatch();

  const calculateTimeElapsed = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);

    if (!start.isValid() || !end.isValid()) {
      console.error("🚨 Las fechas proporcionadas no son válidas");
      return "Fechas no válidas";
    }

    const diffInMinutes = end.diff(start, "minutes");

    if (diffInMinutes < 0) {
      console.error("🚨 La fecha de inicio es posterior a la fecha final");
      return "Error en las fechas";
    }

    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (date) => {
    return moment.utc(date).format("DD/MM/YYYY HH:mm:ss");
  };

  const handleRowClick = (row) => {
    dispatch(setChartFurnace(row));
  };

  return (
    <Card>
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
            label={`${furnaceDataFiltered.length} resultados encontrados`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader aria-label="tabla de datos filtrados">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Grado de acero</strong>
                </TableCell>
                <TableCell>
                  <strong>Fecha Inicio</strong>
                </TableCell>
                <TableCell>
                  <strong>Fecha Finalización</strong>
                </TableCell>
                <TableCell>
                  <strong>Tiempo</strong>
                </TableCell>
                <TableCell>
                  <strong>Consumo original</strong>
                </TableCell>
                <TableCell>
                  <strong>Consumo optimizado</strong>
                </TableCell>
                <TableCell>
                  <strong>Mejora Estimada</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ overflow: "auto" }}>
              {furnaceDataFiltered.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor:
                      item.Status === 0
                        ? "rgba(255, 0, 0, 0.2)"
                        : selectedChartFurnace &&
                          selectedChartFurnace.Consumo_original ===
                            item.Consumo_original
                        ? "rgba(0, 0, 0, 0.1)"
                        : "inherit",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(200, 200, 200, 0.5)",
                    },
                  }}
                  onClick={() => handleRowClick(item)}
                >
                  <TableCell>{item.steelGrade || "-"}</TableCell>
                  <TableCell>{formatDate(item.Fecha_inicio)}</TableCell>
                  <TableCell>{formatDate(item.Fecha_final)}</TableCell>
                  <TableCell>
                    {calculateTimeElapsed(item.Fecha_inicio, item.Fecha_final)}
                  </TableCell>
                  <TableCell>
                    {item.Consumo_original.toFixed(2)} Nm3/h
                  </TableCell>
                  <TableCell>
                    {item.Consumo_optimizado
                      ? `${item.Consumo_optimizado.toFixed(2)} Nm3/h`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {item.Mejora_estimada_porcentaje.toFixed(2)} %
                      {selectedChartFurnace &&
                        selectedChartFurnace.Consumo_original ===
                          item.Consumo_original && (
                          <StackedLineChartIcon
                            fontSize="small"
                            sx={{ marginLeft: 2, marginBottom: 1 }}
                          />
                        )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ChartDataTable;
