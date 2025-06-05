/* eslint-disable no-unused-vars */
import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import moment from "moment";

const SteelTemperatureScatterChart = () => {
  // Obtener los datos filtrados del estado de Redux
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

  // Procesamiento básico de datos
  const currentGrade = filteredData[0].grado_acero || "No especificado";
  const familia = filteredData[0].familia || "No especificada";

  // Crear los datos para el gráfico de dispersión - usar formato simple para evitar errores
  const scatterDataReal = filteredData.map((item, index) => [
    index,
    item.y_original,
  ]);

  const scatterDataPredicha = filteredData.map((item, index) => [
    index,
    item.y_pred_original,
  ]);

  const scatterDataOptimizada = filteredData.map((item, index) => [
    index,
    item.y_pred_optimo,
  ]);

  // Etiquetas para el eje X - procesamos fechas en formato Excel
  const etiquetasX = filteredData.map((item, index) => {
    // Si existe número de colada, lo usamos
    if (item.numcolada) {
      return `${item.numcolada}`;
    }
    // Si no hay número de colada pero hay fecha, procesamos la fecha
    else if (item.fecha_colada) {
      // Verificar si la fecha está en formato de número serial de Excel
      if (typeof item.fecha_colada === "number") {
        // Convertir número serial de Excel a fecha JavaScript
        // Excel usa días desde 30/12/1899, y JavaScript desde 01/01/1970
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

  // Calcular rango para el eje Y
  const allTemps = filteredData
    .flatMap((item) => [
      item.y_original,
      item.y_pred_original,
      item.y_pred_optimo,
    ])
    .filter((t) => t !== null && t !== undefined);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const tempRange = maxTemp - minTemp;

  // Aplicar un margen del 10% al rango
  const yAxisMin = Math.floor(minTemp - tempRange * 0.1);
  const yAxisMax = Math.ceil(maxTemp + tempRange * 0.1);

  // Configuración de zoom para los ejes X e Y
  const dataZoomConfig = [
    {
      type: "slider",
      show: true,
      xAxisIndex: [0],
      start: 0,
      end: 100,
      bottom: 30,
      handleSize: "80%",
      height: 20,
      labelFormatter: (value) => {
        const index = Math.round(value);
        return index < etiquetasX.length ? etiquetasX[index] : "";
      },
    },
    {
      type: "inside",
      xAxisIndex: [0],
      start: 0,
      end: 100,
      zoomOnMouseWheel: true,
      moveOnMouseMove: false,
    },
    {
      type: "slider",
      show: true,
      yAxisIndex: [0],
      start: 0,
      end: 100,
      right: 20,
      width: 20,
      handleSize: "80%",
    },
    {
      type: "inside",
      yAxisIndex: [0],
      start: 0,
      end: 100,
      zoomOnMouseWheel: "shift",
      moveOnMouseMove: false,
    },
  ];

  // Opciones del gráfico
  const option = {
    title: {
      text: `Comparación de temperaturas (real, predicha y optimizada)`,
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        // Ajuste para manejar ambos formatos de datos
        const index = Math.round(params.value[0]) - 1;

        // Protección contra índices fuera de rango
        if (index < 0 || index >= filteredData.length) {
          return `${params.seriesName}: ${params.value[1].toFixed(2)} °C`;
        }

        const colada = etiquetasX[index];
        const item = filteredData[index];

        let fechaStr = "No disponible";
        // Formatear la fecha si existe
        if (item && item.fecha_colada) {
          try {
            if (typeof item.fecha_colada === "number") {
              // Convertir número serial de Excel a fecha JavaScript
              const excelEpoch = new Date(1899, 11, 30);
              const msPerDay = 24 * 60 * 60 * 1000;
              const excelDate = new Date(
                excelEpoch.getTime() + item.fecha_colada * msPerDay
              );
              fechaStr = moment(excelDate).format("DD/MM/YYYY HH:mm");
            } else {
              fechaStr = moment(item.fecha_colada).format("DD/MM/YYYY HH:mm");
            }
          } catch (e) {
            // Si hay error en el formato, usar un valor predeterminado
            fechaStr = String(item.fecha_colada);
          }
        }

        // Mostrar mejora si estamos viendo datos óptimos
        let mejora = "";
        if (
          item &&
          params.seriesName === "Temperatura Optimizada" &&
          item.mejora_kwh
        ) {
          mejora = `<br/>Mejora: ${item.mejora_kwh.toFixed(2)} kWh`;
        }

        return `Colada: ${item?.colada || colada}<br/>
                Fecha: ${fechaStr}<br/>
                ${params.seriesName}: ${params.value[1].toFixed(
          2
        )} °C${mejora}`;
      },
    },
    legend: {
      data: [
        "Temperatura Real",
        "Temperatura Predicha",
        "Temperatura Optimizada",
      ],
      top: 30,
    },
    grid: {
      left: "3%",
      right: "5%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    dataZoom: dataZoomConfig,
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
      name: "Temperatura (°C)",
      min: yAxisMin,
      max: yAxisMax,
    },
    series: [
      {
        name: "Temperatura Real",
        type: "scatter",
        data: scatterDataReal,
        symbol: "circle",
        symbolSize: 12,
        itemStyle: { color: "#FFCC00" }, // Amarillo
      },
      {
        name: "Temperatura Predicha",
        type: "scatter",
        data: scatterDataPredicha,
        symbol: "circle",
        symbolSize: 12,
        itemStyle: { color: "#0066FF" }, // Azul
      },
      {
        name: "Temperatura Optimizada",
        type: "scatter",
        data: scatterDataOptimizada,
        symbol: "circle",
        symbolSize: 12,
        itemStyle: { color: "#33CC33" }, // Verde
      },
    ],
    toolbox: {
      feature: {
        restore: {
          title: "Restablecer",
        },
        saveAsImage: {
          title: "Guardar como imagen",
        },
      },
      right: 10,
      top: 10,
    },
  };

  return (
    <Card sx={{ marginX: 2 }}>
      <CardContent>
        <ReactECharts
          option={option}
          style={{ height: "550px", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </CardContent>
    </Card>
  );
};

export default SteelTemperatureScatterChart;
