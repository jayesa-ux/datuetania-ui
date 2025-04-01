import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  Autocomplete,
  TextField as MuiTextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  setFurnaceDataFiltered,
  setChartFurnace,
} from "../../redux/hornos2Slice";

// eslint-disable-next-line react/prop-types
const FilterComponent = ({ title = "Filtrar Datos", expanded = false }) => {
  const dispatch = useDispatch();
  const furnaceData = useSelector((state) => state.hornos2.furnaceData);

  // Obtener valores únicos para el filtro de familia
  const familias = [
    ...new Set(furnaceData.map((item) => item.familia).filter(Boolean)),
  ];

  // Obtener valores únicos para el filtro de grupo
  const grupos = [
    ...new Set(furnaceData.map((item) => item.grupo).filter(Boolean)),
  ];

  // Obtener valores únicos para los grados de acero
  const gradosAcero = [
    ...new Set(furnaceData.map((item) => item.grado_acero).filter(Boolean)),
  ].sort();

  // Obtener valores únicos para las coladas
  const coladas = [
    ...new Set(furnaceData.map((item) => item.colada).filter(Boolean)),
  ].sort();

  const [formData, setFormData] = useState({
    familiaSeleccionada: null,
    grupoSeleccionado: null,
    gradoAceroSeleccionado: null,
    coladaSeleccionada: null,
    fechaDesde: "",
    fechaHasta: "",
    horaDesde: "00:00",
    horaHasta: "23:59",
  });

  // Estado para controlar si hay algo seleccionado
  const [isFilterSelected, setIsFilterSelected] = useState(false);

  // Verificar si hay algún filtro seleccionado
  useEffect(() => {
    const hasFilter =
      formData.familiaSeleccionada ||
      formData.grupoSeleccionado ||
      formData.gradoAceroSeleccionado ||
      formData.coladaSeleccionada ||
      formData.fechaDesde ||
      formData.fechaHasta;

    setIsFilterSelected(Boolean(hasFilter));
  }, [formData]);

  // Al cargar el componente, no aplicamos filtro por defecto
  useEffect(() => {
    if (furnaceData.length > 0) {
      dispatch(setFurnaceDataFiltered([]));
    }
  }, [furnaceData, dispatch]);

  const handleReset = () => {
    setFormData({
      familiaSeleccionada: null,
      grupoSeleccionado: null,
      gradoAceroSeleccionado: null,
      coladaSeleccionada: null,
      fechaDesde: "",
      fechaHasta: "",
      horaDesde: "00:00",
      horaHasta: "23:59",
    });

    // Al resetear, no mostramos datos
    dispatch(setFurnaceDataFiltered([]));
  };

  const applyFilters = () => {
    // Filtrar datos
    const filteredData = furnaceData.filter((item) => {
      // Filtrar por familia si está seleccionada
      const familiaMatch =
        !formData.familiaSeleccionada ||
        item.familia === formData.familiaSeleccionada;

      // Filtrar por grupo si está seleccionado
      const grupoMatch =
        !formData.grupoSeleccionado ||
        item.grupo === formData.grupoSeleccionado;

      // Filtrar por grado de acero si está seleccionado
      const gradoMatch =
        !formData.gradoAceroSeleccionado ||
        item.grado_acero === formData.gradoAceroSeleccionado;

      // Filtrar por colada si está seleccionada
      const coladaMatch =
        !formData.coladaSeleccionada ||
        item.colada === formData.coladaSeleccionada;

      // Filtrar por fechas y horas
      let fechaDesdeMatch = true;
      let fechaHastaMatch = true;

      if (formData.fechaDesde) {
        // Combinar fecha y hora para el filtro desde
        const fechaHoraDesde = new Date(
          `${formData.fechaDesde}T${formData.horaDesde}`
        );

        // Obtener la fecha del item
        let itemFecha;
        if (typeof item.fecha_colada === "number") {
          // Si es un número serial de Excel
          const excelEpoch = new Date(1899, 11, 30);
          const msPerDay = 24 * 60 * 60 * 1000;
          itemFecha = new Date(
            excelEpoch.getTime() + item.fecha_colada * msPerDay
          );
        } else {
          // Si es una cadena de fecha
          itemFecha = new Date(item.fecha_colada);
        }

        fechaDesdeMatch = itemFecha >= fechaHoraDesde;
      }

      if (formData.fechaHasta) {
        // Combinar fecha y hora para el filtro hasta
        const fechaHoraHasta = new Date(
          `${formData.fechaHasta}T${formData.horaHasta}`
        );

        // Obtener la fecha del item
        let itemFecha;
        if (typeof item.fecha_colada === "number") {
          // Si es un número serial de Excel
          const excelEpoch = new Date(1899, 11, 30);
          const msPerDay = 24 * 60 * 60 * 1000;
          itemFecha = new Date(
            excelEpoch.getTime() + item.fecha_colada * msPerDay
          );
        } else {
          // Si es una cadena de fecha
          itemFecha = new Date(item.fecha_colada);
        }

        fechaHastaMatch = itemFecha <= fechaHoraHasta;
      }

      return (
        familiaMatch &&
        grupoMatch &&
        gradoMatch &&
        coladaMatch &&
        fechaDesdeMatch &&
        fechaHastaMatch
      );
    });

    dispatch(setFurnaceDataFiltered(filteredData));

    // Actualizar el gráfico con el primer elemento de los datos filtrados
    if (filteredData.length > 0) {
      dispatch(setChartFurnace(filteredData[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Variable para controlar si los campos colada, familia y grupo deben estar deshabilitados
  const disableOtherFilters = formData.coladaSeleccionada !== null;

  return (
    <Accordion defaultExpanded={expanded} disableGutters sx={{ marginX: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="chart-filter-content"
        id="chart-filter-header"
      >
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Autocomplete
                  options={coladas}
                  value={formData.coladaSeleccionada}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      coladaSeleccionada: newValue,
                    });
                  }}
                  getOptionLabel={(option) => option?.toString() || ""}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Colada"
                      placeholder="Seleccionar colada"
                      helperText={
                        disableOtherFilters
                          ? "Deshabilita el Grado de Acero para usar este filtro"
                          : ""
                      }
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Autocomplete
                  options={gradosAcero}
                  value={formData.gradoAceroSeleccionado}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      gradoAceroSeleccionado: newValue,
                      coladaSeleccionada: null,
                      familiaSeleccionada: null,
                      grupoSeleccionado: null,
                    });
                  }}
                  disabled={disableOtherFilters}
                  getOptionLabel={(option) => option?.toString() || ""}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Grado de Acero"
                      placeholder="Seleccionar grado"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Autocomplete
                  options={familias}
                  value={formData.familiaSeleccionada}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      familiaSeleccionada: newValue,
                    });
                  }}
                  disabled={disableOtherFilters}
                  getOptionLabel={(option) => option?.toString() || ""}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Familia"
                      placeholder="Seleccionar familia"
                      helperText={
                        disableOtherFilters
                          ? "Deshabilita el Grado de Acero para usar este filtro"
                          : ""
                      }
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Autocomplete
                  options={grupos}
                  value={formData.grupoSeleccionado}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      grupoSeleccionado: newValue,
                    });
                  }}
                  disabled={disableOtherFilters}
                  getOptionLabel={(option) => option?.toString() || ""}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Grupo"
                      placeholder="Seleccionar grupo"
                      helperText={
                        disableOtherFilters
                          ? "Deshabilita el Grado de Acero para usar este filtro"
                          : ""
                      }
                    />
                  )}
                />
              </Grid>

              {/* Fila para fecha y hora "Desde" */}
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Fecha Desde"
                  type="date"
                  value={formData.fechaDesde}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaDesde: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  disabled={disableOtherFilters}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Hora Desde"
                  type="time"
                  value={formData.horaDesde}
                  onChange={(e) =>
                    setFormData({ ...formData, horaDesde: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  disabled={disableOtherFilters}
                />
              </Grid>

              {/* Fila para fecha y hora "Hasta" */}
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Fecha Hasta"
                  type="date"
                  value={formData.fechaHasta}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaHasta: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  disabled={disableOtherFilters}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Hora Hasta"
                  type="time"
                  value={formData.horaHasta}
                  onChange={(e) =>
                    setFormData({ ...formData, horaHasta: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  disabled={disableOtherFilters}
                />
              </Grid>

              <Grid item xs={12}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    alignContent: "end",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                  >
                    Limpiar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!isFilterSelected}
                  >
                    Buscar
                  </Button>
                </div>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </AccordionDetails>
    </Accordion>
  );
};

export default FilterComponent;
