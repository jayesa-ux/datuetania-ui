/* eslint-disable no-unused-vars */
import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import moment from "moment";

const KwhScatterChart = () => {
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

  // Preparar datos de las series
  const kwhOriginalData = [];
  const kwhOptimoData = [];

  // Crear puntos usando los valores de KWH y el índice como posición en el eje X
  filteredData.forEach((item, index) => {
    if (
      item.kwh_tap4_original !== undefined &&
      item.kwh_tap4_original !== null
    ) {
      kwhOriginalData.push([index, item.kwh_tap4_original]);
    }
    if (item.kwh_tap4_optimo !== undefined && item.kwh_tap4_optimo !== null) {
      kwhOptimoData.push([index, item.kwh_tap4_optimo]);
    }
  });

  // Calcular rango para el eje Y
  const allKwh = filteredData
    .flatMap((item) => [item.kwh_tap4_original, item.kwh_tap4_optimo])
    .filter((k) => k !== null && k !== undefined);

  const minKwh = Math.min(...allKwh);
  const maxKwh = Math.max(...allKwh);
  const kwhRange = maxKwh - minKwh;

  // Aplicar un margen del 10% al rango
  const yAxisMin = Math.floor(minKwh - kwhRange * 0.1);
  const yAxisMax = Math.ceil(maxKwh + kwhRange * 0.1);

  // Configuración de zoom
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

  // Función auxiliar para formatear fechas
  const formatearFecha = (fechaColada) => {
    if (!fechaColada) return "No disponible";

    try {
      if (typeof fechaColada === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        const msPerDay = 24 * 60 * 60 * 1000;
        const excelDate = new Date(
          excelEpoch.getTime() + fechaColada * msPerDay
        );
        return moment(excelDate).format("DD/MM/YYYY HH:mm");
      } else {
        return moment(fechaColada).format("DD/MM/YYYY HH:mm");
      }
    } catch (e) {
      return String(fechaColada);
    }
  };

  const option = {
    title: {
      text: `Comparación de Consumo Energético`,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: function (params) {
        // Verificar que hay parámetros
        if (!params || params.length === 0) return "";

        // Obtener el índice del punto
        const dataIndex = params[0].dataIndex;

        // Verificar que el índice es válido
        if (dataIndex < 0 || dataIndex >= filteredData.length) return "";

        // Obtener el item de datos correspondiente
        const item = filteredData[dataIndex];

        // Preparar la información para el tooltip
        let resultado = `<span>Colada: ${
          item.colada || etiquetasX[dataIndex]
        }</span><br/>`;
        resultado += `Fecha: ${formatearFecha(item.fecha_colada)}<br/>`;

        // Agregar información para cada serie
        params.forEach((param) => {
          const color = param.color;
          const nombreSerie = param.seriesName;
          const valor = param.value[1].toFixed(2);
          resultado += `${nombreSerie}: ${valor} kWh<br/>`;
        });

        if (item.mejora_kwh !== undefined && item.mejora_kwh !== null) {
          resultado += `<span style="color:#33CC33">Mejora: ${item.mejora_kwh.toFixed(
            2
          )} kWh</span>`;
        }

        return resultado;
      },
    },
    legend: {
      data: ["Consumo Real", "Consumo Óptimo"],
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
      name: "Consumo Energético (kWh)",
      min: yAxisMin,
      max: yAxisMax,
      axisLabel: {
        formatter: "{value}",
      },
    },
    series: [
      {
        name: "Consumo Real",
        type: "scatter",
        data: kwhOriginalData,
        symbol: "circle",
        symbolSize: 12,
        itemStyle: { color: "#800080" }, // Morado
      },
      {
        name: "Consumo Óptimo",
        type: "scatter",
        data: kwhOptimoData,
        symbol: "circle",
        symbolSize: 12,
        itemStyle: { color: "#FF1493" }, // Rosa/Fucsia
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

export default KwhScatterChart;
