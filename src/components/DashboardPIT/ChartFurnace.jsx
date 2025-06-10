/* eslint-disable no-unused-vars */
import ReactECharts from "echarts-for-react";
import { useSelector } from "react-redux";
import { Grid, Card, CardContent, Box, Typography } from "@mui/material";
import _ from "lodash";
import { useState } from "react";

const ChartFurnace = () => {
  const selectedChartFurnace = useSelector(
    (state) => state.furnace.selectedChartFurnace
  );

  // Estado para manejar el modo de zoom
  const [zoomMode, setZoomMode] = useState("inside"); // 'inside' para zoom con rueda de ratón

  // Si no hay selección, mostrar mensaje
  if (!selectedChartFurnace) {
    return (
      <Card variant="outlined" sx={{ height: 500, overflow: "auto" }}>
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Seleccione un registro en la tabla para visualizar la gráfica
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = selectedChartFurnace;

  // Cálculo de temperatura inicial
  const temperaturaInicio =
    chartData.Temperatura_original -
    chartData.Tramo_tiempo * chartData.Tramo_pendiente;

  // Generar datos para las series
  const seriesDataOriginal = [
    { value: temperaturaInicio, xAxis: 0 }, // Primer punto en x = 0
    { value: chartData.Temperatura_original, xAxis: chartData.Tramo_tiempo }, // Segundo punto
  ];

  const seriesDataPrediccion = [
    { value: temperaturaInicio, xAxis: 0 },
    { value: chartData.Prediccion_temperatura, xAxis: chartData.Tramo_tiempo }, // Segundo punto
  ];

  const seriesDataOptimizacion = [
    { value: temperaturaInicio, xAxis: 0 },
    {
      value: chartData.Prediccion_temperatura_opt,
      xAxis: chartData.Tramo_tiempo_opt,
    }, // Segundo punto
  ];

  // Generar eje X dinámico
  const tramoTiempos = _.sortBy([
    0,
    chartData.Tramo_tiempo,
    chartData.Tramo_tiempo_opt,
  ]);

  // Rango dinámico para el eje Y
  const allValues = [
    ...seriesDataOriginal.map((point) => point.value),
    ...seriesDataPrediccion.map((point) => point.value),
    ...seriesDataOptimizacion.map((point) => point.value),
  ];

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const rangePadding = (maxValue - minValue) * 0.1; // 10% de margen

  // Calcular la diferencia de tiempo en horas con dos decimales
  const timeDifferenceHours = (
    chartData.Tramo_tiempo - chartData.Tramo_tiempo_opt
  ).toFixed(2);

  // Configuración del gráfico con tooltip
  const option = {
    title: {
      text: "Temperatura vs. Tiempo",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      axisPointer: {
        type: "cross",
        snap: true,
      },
      formatter: function (params) {
        const seriesName = params.seriesName;
        const time = params.value[0].toFixed(2);
        const temperature = params.value[1].toFixed(2);

        return `<div style="font-weight: bold; margin-bottom: 5px;">${seriesName}</div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${params.color}; margin-right: 5px;"></span>
                  <strong>Tiempo: ${time} h</strong>
                </div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${params.color}; margin-right: 5px;"></span>
                  <strong>Temperatura: ${temperature} ºC</strong>
                </div>`;
      },
      backgroundColor: "rgba(50, 50, 50, 0.9)",
      borderColor: "#777",
      borderWidth: 1,
      textStyle: {
        color: "#fff",
      },
    },
    legend: {
      left: "right",
      orient: "vertical",
      data: ["Original", "Predicción", "Optimización"],
    },
    grid: {
      left: "5%",
      right: "15%",
      bottom: "12%",
      containLabel: true,
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
        xAxisIndex: 0,
        filterMode: "filter",
      },
      {
        type: "slider",
        start: 0,
        end: 100,
        xAxisIndex: 0,
        height: 20,
        bottom: 0,
        borderColor: "#ccc",
        fillerColor: "rgba(80,80,80,0.2)",
        handleIcon:
          "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "80%",
        handleStyle: {
          color: "#fff",
          shadowBlur: 3,
          shadowColor: "rgba(0, 0, 0, 0.6)",
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        },
      },
    ],
    xAxis: {
      type: "value",
      name: "Tiempo (horas)",
      min: 0,
      max: Math.max(...tramoTiempos) + 0.5,
      axisLabel: {
        formatter: "{value}",
      },
    },
    yAxis: {
      type: "value",
      name: "Temperatura (ºC)",
      min: (minValue - rangePadding).toFixed(2),
      max: (maxValue + rangePadding).toFixed(2),
      axisLabel: {
        formatter: "{value}",
      },
    },
    series: [
      {
        name: "Original",
        type: "line",
        data: seriesDataOriginal.map((point) => [point.xAxis, point.value]),
        lineStyle: { color: "#FF5733", width: 3 },
        itemStyle: { color: "#FF5733" },
        symbol: "circle",
        symbolSize: 10,
        emphasis: {
          scale: true,
          focus: "series",
          lineStyle: {
            width: 4,
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: "#fff",
          },
        },
        triggerLineEvent: true,
      },
      {
        name: "Predicción",
        type: "line",
        data: seriesDataPrediccion.map((point) => [point.xAxis, point.value]),
        lineStyle: { color: "#3357FF", width: 3 },
        itemStyle: { color: "#3357FF" },
        symbol: "circle",
        symbolSize: 10,
        emphasis: {
          scale: true,
          focus: "series",
          lineStyle: {
            width: 4,
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: "#fff",
          },
        },
        triggerLineEvent: true,
      },
      {
        name: "Optimización",
        type: "line",
        data: seriesDataOptimizacion.map((point) => [point.xAxis, point.value]),
        lineStyle: { color: "#33FF57", width: 3 },
        itemStyle: { color: "#33FF57" },
        symbol: "circle",
        symbolSize: 10,
        emphasis: {
          scale: true,
          focus: "series",
          lineStyle: {
            width: 4,
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: "#fff",
          },
        },
        triggerLineEvent: true,
        markArea: {
          itemStyle: {
            color: "rgba(255, 173, 177, 0.4)",
          },
          data: [
            [
              {
                name: "Zona de búsqueda",
                yAxis: seriesDataOptimizacion[1].value - 2,
              },
              {
                yAxis: seriesDataOptimizacion[1].value + 2,
              },
            ],
          ],
        },
      },
    ],
  };

  const toggleZoomMode = () => {
    setZoomMode((prevMode) => (prevMode === "inside" ? "slider" : "inside"));
  };

  const onChartClick = (params) => {
    console.log("Chart clicked:", params);
  };

  const onEvents = {
    click: onChartClick,
  };

  return (
    <Card variant="outlined" sx={{ height: 600, overflow: "auto" }}>
      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <ReactECharts
              option={option}
              style={{ height: 400 }}
              onEvents={onEvents}
              opts={{ renderer: "canvas" }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                mt: 2,
                px: 2,
                py: 1,
                bgcolor: "background.paper",
                borderRadius: 1,
              }}
            >
              <Typography>
                <strong>Diferencia de Tiempo:</strong> {timeDifferenceHours} h
              </Typography>
              <Typography>
                <strong>Pendiente:</strong>{" "}
                {parseFloat(
                  (
                    chartData.Tramo_pendiente - chartData.Tramo_pendiente_opt
                  ).toFixed(2)
                )}
              </Typography>
              <Typography>
                <strong>Mejora estimada:</strong>{" "}
                {parseFloat(chartData.Mejora_estimada.toFixed(2))}
                &nbsp; Nm3/h
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ChartFurnace;
