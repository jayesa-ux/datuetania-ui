/* eslint-disable no-unused-vars */
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import pitFurnaces from "../config/pit-furnaces.json";
import FireplaceIcon from "@mui/icons-material/Fireplace";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setSelectedFurnace,
  setFurnaceData,
  setFurnaceDataFiltered,
  setChartFurnace,
} from "../redux/furnaceSlice";
import { setvariables } from "../redux/variablesSlice";
import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import moment from "moment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Hornos1 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [navigateToDetail, setNavigateToDetail] = useState(false);
  const [selectedFurnace, setSelectedFurnaceState] = useState(null);
  const [jsonData, setJsonData] = useState({ excelData: [], csvData: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigateToDetail && selectedFurnace) {
      dispatch(setSelectedFurnace(selectedFurnace));
      navigate("/Dashboard1");
    }
  }, [navigateToDetail, selectedFurnace, dispatch, navigate]);

  const loadExcelData = async (pitFurnaceCode) => {
    const excelData = await fetchExcelFile(pitFurnaceCode);
    const csvData = await fetchCsvFile(pitFurnaceCode);
    const combinedData = {
      excelData: excelData || [],
      csvData: csvData || [],
    };
    setJsonData(combinedData);

    dispatch(setFurnaceData(combinedData.excelData));
    dispatch(
      setFurnaceDataFiltered(
        combinedData.excelData.filter((item) => item.Status === 1)
      )
    );
    dispatch(setChartFurnace(combinedData.excelData[0]));
    dispatch(setvariables(combinedData.csvData));
  };

  const fetchExcelFile = async (pitFurnaceCode) => {
    try {
      const response = await fetch(
        `/assets/data/optimizations_${pitFurnaceCode.toLowerCase()}.xlsx`
      );
      if (!response.ok) {
        throw new Error("No se pudo cargar el archivo.");
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir el worksheet a JSON
      const json = XLSX.utils.sheet_to_json(worksheet);

      // Convertir las fechas a formato ISO (usando moment para manejar los números serializados)
      const formattedData = json.map((row) => {
        if (row.Fecha_inicio) {
          if (typeof row.Fecha_inicio === "number") {
            // Convertir número serializado de Excel a fecha usando moment
            row.Fecha_inicio = moment(
              (row.Fecha_inicio - 25569) * 86400 * 1000
            ).toISOString();
          }
        }
        if (row.Fecha_final) {
          if (typeof row.Fecha_final === "number") {
            // Convertir número serializado de Excel a fecha usando moment
            row.Fecha_final = moment(
              (row.Fecha_final - 25569) * 86400 * 1000
            ).toISOString();
          }
        }
        return row;
      });
      // Aquí puedes enviar el `formattedData` a tu store de Redux o procesarlo
      return formattedData;
    } catch (err) {
      console.error("Error al leer el archivo Excel:", err);
    }
  };

  const fetchCsvFile = async (pitFurnaceCode) => {
    try {
      const response = await fetch(
        "/assets/data/HPITVARIABLESMES2023-2024.csv"
      );
      if (!response.ok) {
        throw new Error("No se pudo cargar el archivo.");
      }
      const csvText = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            try {
              const filteredData = result.data.filter(
                (item) =>
                  item.SUBPUESTO.toUpperCase() === pitFurnaceCode.toUpperCase()
              );
              const formattedData = filteredData.map((row) => {
                if (row.FecInici) {
                  if (typeof row.FecInici === "number") {
                    row.FecInici = moment
                      .utc((row.FecInici - 25569) * 86400 * 1000)
                      .toISOString();
                  } else if (
                    moment(row.FecInici, moment.ISO_8601, true).isValid()
                  ) {
                    row.FecInici = moment.utc(row.FecInici).toISOString();
                  }
                }
                if (row.FecFinal) {
                  if (typeof row.FecFinal === "number") {
                    row.FecFinal = moment
                      .utc((row.FecFinal - 25569) * 86400 * 1000)
                      .toISOString();
                  } else if (
                    moment(row.FecFinal, moment.ISO_8601, true).isValid()
                  ) {
                    row.FecFinal = moment.utc(row.FecFinal).toISOString();
                  }
                }
                return row;
              });
              resolve(formattedData);
            } catch (error) {
              reject(error);
            }
          },
          error: (err) => reject(err),
        });
      });
    } catch (err) {
      console.error("Error al leer el archivo CSV:", err);
      return [];
    }
  };

  const handleCardClick = async (pitFurnace) => {
    setLoading(true);
    setSelectedFurnaceState(pitFurnace);
    await loadExcelData(pitFurnace.code);
    setTimeout(() => {
      setNavigateToDetail(true);
    }, 1350);
  };

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <Grid container spacing={1} sx={{ padding: 3 }}>
      <Grid item xs={12}>
        <Card sx={{ marginX: 2, padding: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <FireplaceIcon fontSize="large" />
              <Typography variant="h5" component="div" sx={{ marginLeft: 2 }}>
                Seleccione un horno
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <ArrowBackIcon
                fontSize="large"
                sx={{ cursor: "pointer" }}
                onClick={handleBack}
              />
            </Box>
          </Box>
        </Card>
      </Grid>
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {!loading &&
        pitFurnaces.map((item) => (
          <Grid item xs={12} sm={6} md={4} xl={3} key={item.code}>
            <Card
              onClick={() => handleCardClick(item)}
              sx={{
                textAlign: "center",
                padding: 2,
                marginX: 2,
                marginY: 2,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 3,
                  cursor: "pointer",
                },
                backgroundColor: "white",
              }}
            >
              <CardContent sx={{ backgroundColor: "white" }}>
                <FireplaceIcon fontSize="large" />
                <Typography variant="h6" component="div" sx={{ marginTop: 1 }}>
                  {item.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
    </Grid>
  );
};

export default Hornos1;
