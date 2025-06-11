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
  FormControlLabel,
  Checkbox,
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

  // Obtener valores únicos para los grados de acero
  const gradosAcero = [
    ...new Set(furnaceData.map((item) => item.grado_acero).filter(Boolean)),
  ].sort();

  // Obtener valores únicos para las coladas
  const coladas = [
    ...new Set(furnaceData.map((item) => item.colada).filter(Boolean)),
  ].sort();

  const [formData, setFormData] = useState({
    familiasSeleccionadas: [],
    gradosAceroSeleccionados: [],
    coladasSeleccionadas: [],
    fechaDesde: "",
    fechaHasta: "",
    horaDesde: "00:00",
    horaHasta: "23:59",
    soloConMejora: false,
  });

  // Estado para controlar si hay algo seleccionado
  const [isFilterSelected, setIsFilterSelected] = useState(false);

  // Verificar si hay algún filtro seleccionado
  useEffect(() => {
    const hasFilter =
      formData.familiasSeleccionadas.length > 0 ||
      formData.gradosAceroSeleccionados.length > 0 ||
      formData.coladasSeleccionadas.length > 0 ||
      formData.fechaDesde ||
      formData.fechaHasta ||
      formData.soloConMejora;

    setIsFilterSelected(Boolean(hasFilter));
  }, [formData]);

  // Al cargar el componente, mostramos TODOS los datos por defecto
  useEffect(() => {
    if (furnaceData.length > 0) {
      // Procesar datos para calcular mejoras
      const processedData = processDataWithImprovements(furnaceData);
      dispatch(setFurnaceDataFiltered(processedData));

      // Si hay datos, actualizar el gráfico con el primer elemento
      if (processedData.length > 0) {
        dispatch(setChartFurnace(processedData[0]));
      }
    }
  }, [furnaceData, dispatch]);

  // Función para calcular mejoras en todos los casos
  const processDataWithImprovements = (data) => {
    return data.map((item) => {
      // Calcular mejora_kwh si no existe o está vacía
      let mejoraCalculada = item.mejora_kwh;

      if (
        mejoraCalculada === undefined ||
        mejoraCalculada === null ||
        mejoraCalculada === ""
      ) {
        // Intentar calcular la mejora
        const kwhTotal = Number(item.kwh_total) || 0;
        const kwhOriginal = Number(item.kwh_tap4_original) || 0;
        const kwhOptimo = Number(item.kwh_tap4_optimo) || 0;

        if (kwhTotal > 0 && kwhOriginal > 0 && kwhOptimo > 0) {
          const kwhTotalOptimizado = kwhTotal - kwhOriginal + kwhOptimo;
          mejoraCalculada = kwhTotal - kwhTotalOptimizado;
        } else {
          mejoraCalculada = 0;
        }
      }

      return {
        ...item,
        mejora_kwh: Number(mejoraCalculada),
      };
    });
  };

  const handleReset = () => {
    setFormData({
      familiasSeleccionadas: [],
      gradosAceroSeleccionados: [],
      coladasSeleccionadas: [],
      fechaDesde: "",
      fechaHasta: "",
      horaDesde: "00:00",
      horaHasta: "23:59",
      soloConMejora: false,
    });

    // Al resetear, mostramos TODOS los datos procesados
    const processedData = processDataWithImprovements(furnaceData);
    dispatch(setFurnaceDataFiltered(processedData));

    // Actualizar el gráfico con el primer elemento si hay datos
    if (processedData.length > 0) {
      dispatch(setChartFurnace(processedData[0]));
    }
  };

  const applyFilters = () => {
    // Procesar datos primero
    const processedData = processDataWithImprovements(furnaceData);

    // Filtrar datos
    const filteredData = processedData.filter((item) => {
      // Filtrar por familia si hay seleccionadas
      const familiaMatch =
        formData.familiasSeleccionadas.length === 0 ||
        formData.familiasSeleccionadas.includes(item.familia);

      // Filtrar por grado de acero si hay seleccionados
      const gradoMatch =
        formData.gradosAceroSeleccionados.length === 0 ||
        formData.gradosAceroSeleccionados.includes(item.grado_acero);

      // Filtrar por colada si hay seleccionadas
      const coladaMatch =
        formData.coladasSeleccionadas.length === 0 ||
        formData.coladasSeleccionadas.includes(item.colada);

      // Filtrar por mejora si está activado el checkbox
      const mejoraMatch = !formData.soloConMejora || item.mejora_kwh > 0;

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
        gradoMatch &&
        coladaMatch &&
        mejoraMatch &&
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
              <Grid item xs={4}>
                <Autocomplete
                  multiple
                  options={coladas}
                  value={formData.coladasSeleccionadas}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      coladasSeleccionadas: newValue,
                    });
                  }}
                  getOptionLabel={(option) => option?.toString() || ""}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Coladas"
                      placeholder="Seleccionar coladas"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Autocomplete
                  multiple
                  options={gradosAcero}
                  value={formData.gradosAceroSeleccionados}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      gradosAceroSeleccionados: newValue,
                    });
                  }}
                  getOptionLabel={(option) => option?.toString() || ""}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Grados de Acero"
                      placeholder="Seleccionar grados"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Autocomplete
                  multiple
                  options={familias}
                  value={formData.familiasSeleccionadas}
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      familiasSeleccionadas: newValue,
                    });
                  }}
                  getOptionLabel={(option) => option?.toString() || ""}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Familias"
                      placeholder="Seleccionar familias"
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
                />
              </Grid>

              {/* Checkbox para solo optimizaciones con mejora */}
              <Grid item xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.soloConMejora}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          soloConMejora: e.target.checked,
                        })
                      }
                      color="primary"
                    />
                  }
                  label="Solo optimizaciones con mejora"
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
