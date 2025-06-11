/* eslint-disable no-unused-vars */
import ReactECharts from "echarts-for-react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { useSelector } from "react-redux";
import moment from "moment";

const KwhImprovementBarChart = () => {
  const filteredData = useSelector(
    (state) => state.hornos2.furnaceDataFiltered
  );

  if (!filteredData || filteredData.length === 0) {
    return (
      <Card sx={{ margin: 2 }}>
        <CardContent>
          <Typography color="error">
            No hay datos disponibles para mostrar en el gráfico
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const processedData = filteredData.map((item) => {
    if (
      item.kwh_total === undefined ||
      item.kwh_total === null ||
      item.kwh_tap4_original === undefined ||
      item.kwh_tap4_original === null ||
      item.kwh_tap4_optimo === undefined ||
      item.kwh_tap4_optimo === null
    ) {
      return {
        ...item,
        kwhTotalOptimizado: null,
        porcentajeMejora: null,
      };
    }

    const kwhTotal = Number(item.kwh_total);
    const kwhOriginal = Number(item.kwh_tap4_original);
    const kwhOptimo = Number(item.kwh_tap4_optimo);

    if (isNaN(kwhTotal) || isNaN(kwhOriginal) || isNaN(kwhOptimo)) {
      return {
        ...item,
        kwhTotalOptimizado: null,
        porcentajeMejora: null,
      };
    }

    const kwhTotalOptimizado = kwhTotal - kwhOriginal + kwhOptimo;

    const porcentajeMejora = ((kwhTotal - kwhTotalOptimizado) / kwhTotal) * 100;

    return {
      ...item,
      kwhTotalOptimizado,
      porcentajeMejora: isNaN(porcentajeMejora) ? null : porcentajeMejora,
    };
  });

  const validData = processedData.filter(
    (item) => item.porcentajeMejora !== null
  );

  if (validData.length === 0) {
    return (
      <Card sx={{ margin: 2 }}>
        <CardContent>
          <Typography color="error">
            No se pudieron calcular las mejoras para los datos filtrados
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const mejoraMedia =
    validData.reduce((acc, item) => acc + item.porcentajeMejora, 0) /
    validData.length;
  const mejoraMínima = Math.min(
    ...validData.map((item) => item.porcentajeMejora)
  );
  const mejoraMáxima = Math.max(
    ...validData.map((item) => item.porcentajeMejora)
  );

  const varianza =
    validData.reduce((acc, item) => {
      const diff = item.porcentajeMejora - mejoraMedia;
      return acc + diff * diff;
    }, 0) / validData.length;

  const desviacionEstandar = Math.sqrt(varianza);

  const etiquetasX = validData.map((item, index) => {
    // Si existe número de colada, lo usamos
    if (item.numcolada) {
      return `${item.numcolada}`;
    }
    // Si no hay número de colada pero hay fecha, procesamos la fecha
    else if (item.fecha_colada) {
      // Verificar si la fecha está en formato de número serial de Excel
      if (typeof item.fecha_colada === "number") {
        // Convertir número serial de Excel a fecha JavaScript
        const excelEpoch = new Date(1899, 11, 30);
        const msPerDay = 24 * 60 * 60 * 1000;
        const excelDate = new Date(
          excelEpoch.getTime() + item.fecha_colada * msPerDay
        );
        return moment(excelDate).format("DD/MM/YY HH:mm");
      } else {
        // Si ya es un string de fecha, simplemente formatearlo
        return moment(item.fecha_colada).format("DD/MM/YY");
      }
    }
    // Si no hay nada, usamos el índice
    else {
      return `#${index + 1}`;
    }
  });

  const improvementData = validData.map((item) => item.porcentajeMejora);

  const barColors = improvementData.map((value) => {
    if (value <= 0) return "#FF4D4D";
    else "#FFB84D";
    return "#00CC00";
  });

  const option = {
    title: {
      text: `Porcentaje de Mejora en Consumo Energético`,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        const index = params[0].dataIndex;
        const colada = etiquetasX[index];
        const item = validData[index];

        let fechaStr = "";
        if (item.fecha_colada) {
          if (typeof item.fecha_colada === "number") {
            const excelEpoch = new Date(1899, 11, 30);
            const msPerDay = 24 * 60 * 60 * 1000;
            const excelDate = new Date(
              excelEpoch.getTime() + item.fecha_colada * msPerDay
            );
            fechaStr = moment(excelDate).format("DD/MM/YYYY HH:mm");
          } else {
            fechaStr = moment(item.fecha_colada).format("DD/MM/YYYY HH:mm");
          }
        }

        return `Colada: ${item.colada || colada}<br/>
                Fecha: ${fechaStr}<br/>
                Consumo Original: ${Number(item.kwh_total).toFixed(2)} kWh<br/>
                Consumo Optimizado: ${Number(item.kwhTotalOptimizado).toFixed(
                  2
                )} kWh<br/>
                Mejora: ${Number(item.porcentajeMejora).toFixed(2)}%`;
      },
    },
    grid: {
      left: "6%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      name: "Fecha de colada",
      nameLocation: "middle",
      nameGap: 80,
      data: etiquetasX,
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 10,
      },
    },
    yAxis: {
      type: "value",
      name: "Mejora (%) en Consumo Energético",
      axisLabel: {
        formatter: "{value}",
      },
    },
    series: [
      {
        name: "Porcentaje de Mejora",
        type: "bar",
        data: improvementData.map((value, index) => ({
          value: value,
          itemStyle: {
            color: barColors[index],
          },
        })),
        label: {
          show: true,
          position: "top",
          formatter: function (params) {
            return Number(params.value).toFixed(2) + "%";
          },
          fontSize: 10,
        },
      },
    ],
  };

  return (
    <>
      <Card sx={{ marginX: 2 }}>
        <CardContent>
          <ReactECharts
            option={option}
            style={{ height: "500px", width: "100%" }}
            opts={{ renderer: "canvas" }}
          />
        </CardContent>
      </Card>

      <Card sx={{ margin: 2, marginTop: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom align="center">
            Estadísticas de Mejoras en el Consumo (%)
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={2}
                sx={{ p: 2, bgcolor: "#f0f7ff", height: "100%" }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Media
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary.dark"
                  >
                    {mejoraMedia.toFixed(2)}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={2}
                sx={{ p: 2, bgcolor: "#f0f7ff", height: "100%" }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Mínimo
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary.dark"
                  >
                    {mejoraMínima.toFixed(2)}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={2}
                sx={{ p: 2, bgcolor: "#f0f7ff", height: "100%" }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Máximo
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary.dark"
                  >
                    {mejoraMáxima.toFixed(2)}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={2}
                sx={{ p: 2, bgcolor: "#f0f7ff", height: "100%" }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Desviación Std
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary.dark"
                  >
                    {desviacionEstandar.toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default KwhImprovementBarChart;
