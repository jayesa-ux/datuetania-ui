import { useEffect, useRef, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import * as echarts from "echarts";

const ConsumptionDistributionChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const filteredData = useSelector(
    (state) => state.hornos2.furnaceDataFiltered
  );
  const [selectedIntervals, setSelectedIntervals] = useState([]);

  // Definición consistente de colores para todo el componente
  const COLORS = {
    operario: "rgb(92, 94, 251)", // Azul/violeta
    modelo: "rgb(245, 94, 98)", // Rojo
    coincidencia: "rgb(190, 38, 100)", // Magenta oscuro
  };

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);

      // Configurar evento de redimensionamiento
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      window.addEventListener("resize", handleResize);

      // Limpiar cuando el componente se desmonte
      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, []);

  // Renderizar el gráfico cuando los datos filtrados cambien
  useEffect(() => {
    if (!chartInstance.current || !filteredData || filteredData.length === 0) {
      return;
    }

    // Procesar datos y renderizar gráfico
    const processedData = processChartData(filteredData);
    renderChart(processedData);
  }, [filteredData]);

  // Procesar los datos para el gráfico
  const processChartData = (data) => {
    // Obtener todos los valores de consumo TAP13
    const operarioValues = data.map(
      (item) => Number(item.kwh_tap4_original) || 0
    );
    const modeloValues = data.map((item) => Number(item.kwh_tap4_optimo) || 0);

    // Encontrar el valor mínimo y máximo para crear los rangos
    const allValues = [...operarioValues, ...modeloValues];
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    // Crear 10 intervalos entre el mínimo y máximo
    const intervalSize = (maxValue - minValue) / 10;
    const intervals = Array.from({ length: 10 }, (_, i) => {
      const start = minValue + i * intervalSize;
      const end = minValue + (i + 1) * intervalSize;
      return {
        label: `${start.toFixed(0)}-${end.toFixed(0)}`,
        start,
        end,
      };
    });

    // Contar frecuencias para cada intervalo
    const operarioFrequency = intervals.map((interval) => {
      return operarioValues.filter(
        (val) => val >= interval.start && val < interval.end
      ).length;
    });

    const modeloFrequency = intervals.map((interval) => {
      return modeloValues.filter(
        (val) => val >= interval.start && val < interval.end
      ).length;
    });

    // Procesar datos para barras apiladas
    const stackedData = intervals.map((interval, index) => {
      const oFreq = operarioFrequency[index];
      const mFreq = modeloFrequency[index];

      // Calcular coincidencias como el mínimo entre operario y modelo
      // Este enfoque muestra correctamente cuando hay valores compartidos
      const coincidencia = Math.min(oFreq, mFreq);

      // Solo operario = coladas que están únicamente en operario (restando las coincidencias)
      const soloOperario = oFreq - coincidencia;

      // Solo modelo = coladas que están únicamente en modelo (restando las coincidencias)
      const soloModelo = mFreq - coincidencia;

      // Total real (suma de las tres categorías)
      const total = soloOperario + coincidencia + soloModelo;

      // Calcular proporciones
      const propOperario = total > 0 ? soloOperario / total : 0;
      const propCoincidencia = total > 0 ? coincidencia / total : 0;
      const propModelo = total > 0 ? soloModelo / total : 0;

      return {
        label: interval.label,
        totalFrequency: total,
        soloOperario,
        coincidencia,
        soloModelo,
        propOperario,
        propCoincidencia,
        propModelo,
      };
    });

    return {
      intervals: intervals.map((int) => int.label),
      operarioFrequency,
      modeloFrequency,
      stackedData,
      rawData: data,
    };
  };

  // Renderizar el gráfico con los datos procesados
  const renderChart = (data) => {
    if (!chartInstance.current) return;

    const option = {
      title: {
        text: "Comparación de consumos: Operario vs Modelo",
        left: "center",
        top: 10,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params) {
          const intervalLabel = params[0].name;
          const intervalIndex = data.intervals.indexOf(intervalLabel);
          const intervalData = data.stackedData[intervalIndex];

          // Obtener los valores originales totales
          const totalOperario = data.operarioFrequency[intervalIndex];
          const totalModelo = data.modeloFrequency[intervalIndex];

          let html = `<div><strong>Intervalo: ${intervalLabel} kWh</strong><br/>`;

          // Información detallada de frecuencias con los colores correctos, mostrando totales reales
          html += `<br/><strong>Frecuencias:</strong>`;
          html += `<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${COLORS.operario}"></span>`;
          html += `Operario: ${totalOperario} coladas`;

          html += `<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${COLORS.modelo}"></span>`;
          html += `Modelo: ${totalModelo} coladas`;

          html += `<br/><strong>Total: ${intervalData.totalFrequency} coladas</strong>`;
          html += "</div>";
          return html;
        },
      },
      legend: {
        data: ["Solo Operario", "Solo Modelo", "Coincidencia"],
        top: 35,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        containLabel: true,
      },
      dataZoom: [
        {
          type: "slider",
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100,
          bottom: 20,
          handleSize: "80%",
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
      xAxis: {
        type: "category",
        data: data.intervals,
        name: "Consumo Energético (kWh)",
        nameLocation: "middle",
        nameGap: 60,
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: {
        type: "value",
        name: "Frecuencia (coladas)",
        axisLabel: {
          formatter: "{value}",
        },
      },
      series: [
        {
          name: "Coincidencia",
          type: "bar",
          stack: "total",
          emphasis: {
            focus: "series",
          },
          data: data.stackedData.map((d) => d.coincidencia),
          itemStyle: {
            color: COLORS.coincidencia,
          },
          label: {
            show: true,
            formatter: (params) => {
              if (params.value > 0) {
                return `${params.value}`;
              }
              return "";
            },
            position: "inside",
            fontSize: 10,
            color: "#fff",
          },
        },
        {
          name: "Solo Operario",
          type: "bar",
          stack: "total",
          emphasis: {
            focus: "series",
          },
          data: data.stackedData.map((d) => d.soloOperario),
          itemStyle: {
            color: COLORS.operario,
          },
          label: {
            show: true,
            formatter: (params) => {
              if (params.value > 0) {
                return `${params.value}`;
              }
              return "";
            },
            position: "inside",
            fontSize: 10,
            color: "#fff",
          },
        },
        {
          name: "Solo Modelo",
          type: "bar",
          stack: "total",
          emphasis: {
            focus: "series",
          },
          data: data.stackedData.map((d) => d.soloModelo),
          itemStyle: {
            color: COLORS.modelo,
          },
          label: {
            show: true,
            formatter: (params) => {
              if (params.value > 0) {
                return `${params.value}`;
              }
              return "";
            },
            position: "inside",
            fontSize: 10,
            color: "#fff",
          },
        },
      ],
    };

    // Configurar evento de selección
    chartInstance.current.off("click");
    chartInstance.current.on("click", function (params) {
      // Si es un click en una barra, seleccionar el intervalo
      if (params.componentType === "series") {
        const intervalIndex = data.intervals.indexOf(params.name);

        // Comprobar si ya está seleccionado para alternarlo
        const isAlreadySelected = selectedIntervals.includes(intervalIndex);

        if (isAlreadySelected) {
          setSelectedIntervals((prev) =>
            prev.filter((idx) => idx !== intervalIndex)
          );
        } else {
          setSelectedIntervals((prev) => [...prev, intervalIndex]);
        }

        // Resaltar visualmente la selección
        chartInstance.current.dispatchAction({
          type: isAlreadySelected ? "downplay" : "highlight",
          seriesIndex: [0, 1, 2], // Todas las series
          dataIndex: intervalIndex,
        });
      }
    });

    chartInstance.current.setOption(option);
  };

  // Si no hay datos para mostrar
  if (!filteredData || filteredData.length === 0) {
    return (
      <Card sx={{ margin: 2 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary" align="center">
            Aplique filtros para visualizar la comparación de consumo
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ margin: 2 }}>
      <CardContent>
        {/* Contenedor del gráfico */}
        <div ref={chartRef} style={{ height: "500px", width: "100%" }} />

        {/* La leyenda inferior ha sido eliminada según la especificación */}
      </CardContent>
    </Card>
  );
};

export default ConsumptionDistributionChart;
