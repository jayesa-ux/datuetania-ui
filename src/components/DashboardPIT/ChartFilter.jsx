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
  Checkbox,
  FormControlLabel,
  Autocomplete,
  TextField as MuiTextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  setFurnaceDataFiltered,
  setChartFurnace,
} from "../../redux/furnaceSlice";
import pitSteelGrades from "../../config/pit-steel-grades.json";

const ChartFilter = () => {
  const dispatch = useDispatch();
  const furnaceData = useSelector((state) => state.furnace.furnaceData);
  const selectedFurnace = useSelector((state) => state.furnace.selectedFurnace);

  // Pre-procesamos los datos de horno con los grados de acero
  const [processedFurnaceData, setProcessedFurnaceData] = useState([]);

  // Obtenemos los grados de acero específicos para el horno seleccionado
  const options =
    selectedFurnace && selectedFurnace.code
      ? pitSteelGrades[selectedFurnace.code.toLowerCase()] || []
      : [];

  const selectAllOption = "Seleccionar todos";

  const [formData, setFormData] = useState({
    startDate: "",
    startHour: "",
    endDate: "",
    endHour: "",
    selectedOptions: [],
    status: true,
    mejoraMin: "",
    mejoraMax: "",
  });

  useEffect(() => {
    setProcessedFurnaceData(furnaceData);
  }, [furnaceData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      startDate: "",
      startHour: "",
      endDate: "",
      endHour: "",
      selectedOptions: [],
      status: true,
      mejoraMin: "",
      mejoraMax: "",
    });

    // Mostrar solo las optimizadas cuando se resetea el filtro (status: true por defecto)
    dispatch(
      setFurnaceDataFiltered(
        processedFurnaceData.filter((item) => item.Status === 1)
      )
    );

    // Limpiar la selección del gráfico
    dispatch(setChartFurnace(null));
  };

  const handleAutocompleteChange = (event, newValue) => {
    if (newValue.includes(selectAllOption)) {
      setFormData((prevState) => ({
        ...prevState,
        selectedOptions: options,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        selectedOptions: newValue,
      }));
    }
  };

  const handleCheckboxChange = (event) => {
    setFormData((prevState) => ({
      ...prevState,
      status: event.target.checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Construir fechas con hora opcional (por defecto inicio de día o fin de día)
    let startDate = null;
    if (formData.startDate) {
      const timeStr = formData.startHour || "00:00";
      startDate = new Date(`${formData.startDate}T${timeStr}`);
    }

    let endDate = null;
    if (formData.endDate) {
      const timeStr = formData.endHour || "23:59";
      endDate = new Date(`${formData.endDate}T${timeStr}`);
    }

    const mejoraMin = parseFloat(formData.mejoraMin) || 0;
    const mejoraMax = parseFloat(formData.mejoraMax) || Infinity;

    const filteredData = processedFurnaceData.filter((item) => {
      const fechaInicio = new Date(item.Fecha_inicio);
      const fechaFinal = new Date(item.Fecha_final);

      // Filtro de fechas
      const assertDate =
        (!startDate || fechaInicio >= startDate) &&
        (!endDate || fechaFinal <= endDate);

      // Filtro de mejora estimada
      const assertMejora =
        item.Mejora_estimada_porcentaje >= mejoraMin &&
        item.Mejora_estimada_porcentaje <= mejoraMax;

      const assertStatus = formData.status ? item.Status === 1 : true;

      // Filtro de grado de acero
      const assertSteelGrade =
        formData.selectedOptions.length === 0 ||
        formData.selectedOptions.includes(item.steelGrade);

      return assertDate && assertMejora && assertStatus && assertSteelGrade;
    });

    dispatch(setFurnaceDataFiltered(filteredData));
  };

  return (
    <Accordion disableGutters sx={{ marginX: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="chart-filter-content"
        id="chart-filter-header"
      >
        <Typography variant="h6">Filtrar Pendientes</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Fecha Desde"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Hora Desde (Opcional)"
                  type="time"
                  name="startHour"
                  value={formData.startHour}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Fecha Hasta"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Hora Hasta (Opcional)"
                  type="time"
                  name="endHour"
                  value={formData.endHour}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  multiple
                  options={[selectAllOption, ...options]}
                  value={formData.selectedOptions}
                  onChange={handleAutocompleteChange}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Grados de acero"
                      placeholder="Selecciona los grados de acero"
                    />
                  )}
                  disabled={options.length === 0}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Mejora mínima (%)"
                  type="number"
                  name="mejoraMin"
                  value={formData.mejoraMin}
                  onChange={(e) =>
                    setFormData({ ...formData, mejoraMin: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Mejora máxima (%)"
                  type="number"
                  name="mejoraMax"
                  value={formData.mejoraMax}
                  onChange={(e) =>
                    setFormData({ ...formData, mejoraMax: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.status}
                      onChange={handleCheckboxChange}
                      name="status"
                    />
                  }
                  label="Solo optimizadas"
                />
              </Grid>
              <Grid item xs={9}>
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
                  <Button type="submit" variant="contained" color="primary">
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

export default ChartFilter;
