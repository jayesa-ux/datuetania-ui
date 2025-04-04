import { useState } from "react";
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
import { setFurnaceDataFiltered } from "../../redux/furnaceSlice";
import moment from "moment";

const ChartFilter = () => {
  const dispatch = useDispatch();
  const furnaceData = useSelector((state) => state.furnace.furnaceData);
  let filteredFurnaceData = useSelector((state) => state.furnace.furnaceData);

  const variables = useSelector((state) => state.variables.variablesData);

  const options = [
    ...new Set(variables.map((variable) => variable.CodArtic.slice(-5))),
  ];
  const selectAllOption = "Seleccionar todos";

  const [formData, setFormData] = useState({
    startDate: "",
    startHour: "",
    endDate: "",
    endHour: "",
    selectedOptions: [],
    status: true,
  });

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

    if (newValue?.length > 0) {
      // Filtrar variables basadas en los últimos 5 dígitos
      const filteredVariables = variables.filter((item) => {
        const lastFiveDigits = item.CodArtic.slice(-5);
        // const lastFiveDigits = item.CodArtic;
        return newValue.includes(lastFiveDigits);
      });

      filteredFurnaceData = furnaceData.filter((furnace) => {
        // Convertir las fechas de furnaceData a momentos
        const fechaInicioFurnace = moment(furnace.Fecha_inicio);

        // Verificar si la fecha de inicio está en algún rango de filteredVariables
        return filteredVariables.some((variable) => {
          const fechaInicioVariable = moment(variable.FecInici);
          const fechaFinalVariable = moment(variable.FecFinal);

          return fechaInicioFurnace.isBetween(
            fechaInicioVariable,
            fechaFinalVariable,
            null,
            "[]"
          );
        });
      });
      dispatch(setFurnaceDataFiltered(filteredFurnaceData));
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

    const startDate =
      formData.startDate && formData.startHour
        ? new Date(`${formData.startDate}T${formData.startHour}`)
        : null;
    const endDate =
      formData.endDate && formData.endHour
        ? new Date(`${formData.endDate}T${formData.endHour}`)
        : null;

    const mejoraMin = parseFloat(formData.mejoraMin) || 0;
    const mejoraMax = parseFloat(formData.mejoraMax) || Infinity;

    const filteredData = filteredFurnaceData.filter((item) => {
      const fechaInicio = new Date(item.Fecha_inicio);
      const fechaFinal = new Date(item.Fecha_final);

      const assertDate =
        (!startDate || fechaInicio >= startDate) &&
        (!endDate || fechaFinal <= endDate);

      const assertMejora =
        item.Mejora_estimada_porcentaje >= mejoraMin &&
        item.Mejora_estimada_porcentaje <= mejoraMax;

      const assertStatus = formData.status
        ? item.Status === 1
        : item.Status === 0;
      return assertDate && assertMejora && assertStatus;
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
                  label="Hora Desde"
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
                  label="Hora Hasta"
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
