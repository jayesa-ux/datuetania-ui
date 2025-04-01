import { Grid, CircularProgress, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFurnaceData, setFurnaceDataFiltered } from "../redux/hornos2Slice";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const Hornos2 = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [setLoading] = useState(true);

  useEffect(() => {
    loadExcelData();
  }, []);

  const loadExcelData = async () => {
    try {
      const excelData = await fetchExcelFile();
      dispatch(setFurnaceData(excelData));
      dispatch(setFurnaceDataFiltered(excelData));
      setTimeout(() => {
        navigate("/Dashboard2");
      }, 2000);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      setLoading(false);
    }
  };

  const fetchExcelFile = async () => {
    try {
      const response = await fetch(`/assets/data/opt_EAF_total2.xlsx`);
      if (!response.ok) {
        throw new Error("No se pudo cargar el archivo.");
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const formattedData = json.map((row) => {
        return {
          ...row,
          time_diff: parseFloat(row.time_diff || 0),
          kwh_total: parseFloat(row.kwh_total || 0),
          mejora_kwh: parseFloat(row.mejora_kwh || 0),
        };
      });

      return formattedData;
    } catch (err) {
      console.error("Error al leer el archivo Excel:", err);
      return [];
    }
  };

  return (
    <Grid container spacing={2} sx={{ padding: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "70vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    </Grid>
  );
};

export default Hornos2;
