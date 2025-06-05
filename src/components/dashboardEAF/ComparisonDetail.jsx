/* eslint-disable no-unused-vars */
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import * as echarts from "echarts";

// Componente para el gráfico de barras de consumo
function ConsumptionBarChart({ selectedRow }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Inicializar gráfico cuando el componente se monte
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    return () => {
      // Limpiar cuando el componente se desmonte
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedRow || !chartInstance.current) return;

    try {
      // Preparar datos para el gráfico
      const kwhTotal = Number(selectedRow.kwh_total) || 0;
      const kwhTap4Original = Number(selectedRow.kwh_tap4_original) || 0;
      const kwhTap4Optimo = Number(selectedRow.kwh_tap4_optimo) || 0;

      // Calcular valores para comparar
      const kwhTotalOptimizado = kwhTotal - kwhTap4Original + kwhTap4Optimo;

      // Calcular porcentajes de mejora
      const porcentajeMejoraTotal =
        ((kwhTotal - kwhTotalOptimizado) / kwhTotal) * 100;
      const porcentajeMejoraTap =
        ((kwhTap4Original - kwhTap4Optimo) / kwhTap4Original) * 100;

      // Configuración del gráfico
      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params) {
            const index = params[0].dataIndex;
            if (index === 0) {
              return (
                `<b>KWH Total</b><br/>` +
                `Original: ${kwhTotal.toFixed(2)} kWh<br/>` +
                `Optimizado: ${kwhTotalOptimizado.toFixed(2)} kWh<br/>` +
                `<b>Mejora: ${porcentajeMejoraTotal.toFixed(2)}%</b>`
              );
            } else {
              return (
                `<b>KWH TAP13</b><br/>` +
                `Original: ${kwhTap4Original.toFixed(2)} kWh<br/>` +
                `Optimizado: ${kwhTap4Optimo.toFixed(2)} kWh<br/>` +
                `<b>Mejora: ${porcentajeMejoraTap.toFixed(2)}%</b>`
              );
            }
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: ["KWH Total", "KWH TAP13"],
          axisLabel: {
            interval: 0,
            rotate: 0,
          },
        },
        yAxis: {
          type: "value",
          name: "Mejora Relativa (%)",
          axisLabel: {
            formatter: "{value}%",
          },
        },
        series: [
          {
            name: "Porcentaje de Mejora",
            type: "bar",
            data: [
              {
                value: porcentajeMejoraTotal.toFixed(2),
                itemStyle: { color: "#33CC33" },
              },
              {
                value: porcentajeMejoraTap.toFixed(2),
                itemStyle: { color: "#33CC33" },
              },
            ],
            barWidth: "40%",
            label: {
              show: true,
              position: "top",
              formatter: "{c}%",
              fontSize: 12,
              fontWeight: "bold",
            },
          },
        ],
      };

      // Establecer opciones y renderizar gráfico
      chartInstance.current.setOption(option);
    } catch (error) {
      console.error("Error al renderizar el gráfico:", error);
    }
  }, [selectedRow]);

  return <div ref={chartRef} style={{ width: "100%", height: "250px" }} />;
}

// PropTypes para el componente de gráfico
ConsumptionBarChart.propTypes = {
  selectedRow: PropTypes.object,
};

function ComparisonDetail({ selectedRow }) {
  if (!selectedRow) {
    return null;
  }

  // Función para formatear números con 2 decimales y manejar valores inválidos
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(Number(num))) {
      return "-";
    }
    return Number(num).toFixed(2);
  };

  // Cálculo seguro del KWH total después de la optimización
  const calcularKwhTotalOptimizado = () => {
    try {
      if (
        selectedRow.kwh_total === undefined ||
        selectedRow.kwh_total === null ||
        selectedRow.kwh_tap4_original === undefined ||
        selectedRow.kwh_tap4_original === null ||
        selectedRow.kwh_tap4_optimo === undefined ||
        selectedRow.kwh_tap4_optimo === null
      ) {
        return "-";
      }

      const kwhTotal = Number(selectedRow.kwh_total);
      const kwhOriginal = Number(selectedRow.kwh_tap4_original);
      const kwhOptimo = Number(selectedRow.kwh_tap4_optimo);

      if (isNaN(kwhTotal) || isNaN(kwhOriginal) || isNaN(kwhOptimo)) {
        return "-";
      }

      return kwhTotal - kwhOriginal + kwhOptimo;
    } catch (error) {
      console.error("Error al calcular KWH total optimizado:", error);
      return "-";
    }
  };

  // Valor calculado del KWH total optimizado
  const kwhTotalOptimizado = calcularKwhTotalOptimizado();

  return (
    <Card sx={{ margin: 2, marginTop: 0 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Detalles de la Colada: {selectedRow.colada || "-"}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                backgroundColor: "#f5f5f5",
                height: "100%",
              }}
            >
              <Typography variant="h6" color="primary" gutterBottom>
                Antes de la optimización
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle1">KWH total:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatNumber(selectedRow.kwh_total)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle1">KWH TAP13:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatNumber(selectedRow.kwh_tap4_original)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle1">
                  Temperatura original (ºC):
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatNumber(selectedRow.y_original)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle1">
                  Temperatura predicha (ºC):
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatNumber(selectedRow.y_pred_original)}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                backgroundColor: "#e8f5e9",
                height: "100%",
              }}
            >
              <Typography variant="h6" color="success.main" gutterBottom>
                Después de la optimización
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle1">KWH total:</Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color="success.dark"
                >
                  {formatNumber(kwhTotalOptimizado)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle1">KWH Óptimo:</Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color="success.dark"
                >
                  {formatNumber(selectedRow.kwh_tap4_optimo)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle1">
                  Temperatura óptima predicha (ºC):
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color="success.dark"
                >
                  {formatNumber(selectedRow.y_pred_optimo)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              ></Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{ p: 2, bgcolor: "#fafafa", height: "100%" }}
            >
              <Typography
                variant="h6"
                color="primary"
                gutterBottom
                align="center"
              >
                Porcentaje de mejora con optimización
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <ConsumptionBarChart selectedRow={selectedRow} />
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

ComparisonDetail.propTypes = {
  selectedRow: PropTypes.object,
};

export default ComparisonDetail;
