import ReactECharts from 'echarts-for-react';
import { useSelector } from 'react-redux';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import _ from 'lodash';

const ChartFurnace = () => {
    const selectedChartFurnace = useSelector((state) => state.furnace.selectedChartFurnace);

    const chartData = selectedChartFurnace;

    // Cálculo de temperatura inicial
    const temperaturaInicio = chartData.Temperatura_original - chartData.Tramo_tiempo * chartData.Tramo_pendiente;

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
        { value: chartData.Prediccion_temperatura_opt, xAxis: chartData.Tramo_tiempo_opt }, // Segundo punto
    ];

    // Generar eje X dinámico
    const tramoTiempos = _.sortBy([0, chartData.Tramo_tiempo, chartData.Tramo_tiempo_opt]);

    // Rango dinámico para el eje Y
    const allValues = [
        ...seriesDataOriginal.map((point) => point.value),
        ...seriesDataPrediccion.map((point) => point.value),
        ...seriesDataOptimizacion.map((point) => point.value),
    ];

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const rangePadding = (maxValue - minValue) * 0.1; // 10% de margen

    // Configuración del gráfico
    const option = {
        title: {
            text: '',
            subtext: '',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: function (params) {
                let content = ``;
                params.forEach(item => {
                    content += `<strong>${item.seriesName}: ${item.value[1].toFixed(2)}</strong><br />`; // Muestra el nombre de la serie y el valor
                });
                return content;
              }
        },
        legend: {
            left: 'left',
        },
        xAxis: {
            type: 'value', // Eje X continuo
            name: 'Tiempo',
            min: 0,
            max: Math.max(...tramoTiempos) + 0.5, // Agregar margen al final
        },
        yAxis: {
            type: 'value',
            name: 'Temperatura (Cº)',
            min: (minValue - rangePadding).toFixed(2),
            max: (maxValue + rangePadding).toFixed(2),
        },
        series: [
            {
                name: 'Original',
                type: 'line',
                data: seriesDataOriginal.map((point) => [point.xAxis, point.value]),
                lineStyle: { color: '#FF5733' },
                itemStyle: { color: '#FF5733' },
            },
            {
                name: 'Predicción',
                type: 'line',
                data: seriesDataPrediccion.map((point) => [point.xAxis, point.value]),
                lineStyle: { color: '#3357FF' },
                itemStyle: { color: '#3357FF' },
            },
            {
                name: 'Optimización',
                type: 'line',
                data: seriesDataOptimizacion.map((point) => [point.xAxis, point.value]),
                lineStyle: { color: '#33FF57' },
                itemStyle: { color: '#33FF57' },
                markArea: {
                    itemStyle: {
                      color: 'rgba(255, 173, 177, 0.4)'
                    },
                    data: [
                      [
                        {
                          name: 'Zona de búsqueda',
                          yAxis: seriesDataOptimizacion[1].value-2
                        },
                        {
                          yAxis: seriesDataOptimizacion[1].value+2
                        }
                      ]
                    ]
                  }
            },
        ],
    };

    return (
        <Card variant="outlined" sx={{ height: 400, overflow: 'auto', marginRight: 2, padding: 1 }}>
            <CardContent>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <ReactECharts option={option} />
                    </Grid>
                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography>                                  
                                Tiempo: {parseFloat((chartData.Tramo_tiempo - chartData.Tramo_tiempo_opt).toFixed(2))}
                            </Typography>
                            <Typography>
                                Pendiente: {parseFloat((chartData.Tramo_pendiente - chartData.Tramo_pendiente_opt).toFixed(2))}
                            </Typography>
                            <Typography>Mejora estimada: {parseFloat(chartData.Mejora_estimada.toFixed(2))}</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default ChartFurnace;
