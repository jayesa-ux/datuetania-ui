import { Grid, Typography, Card } from "@mui/material";
import { useSelector } from "react-redux";
import FilterComponent from "../components/dashboard2/FilterComponent";
import FilteredDataTable from "../components/dashboard2/FilteredDataTable";
import SteelTemperatureScatterChart from "../components/dashboard2/SteelTemperatureScatterChart";
import KwhScatterChart from "../components/dashboard2/KwhScatterChart";
import KwhImprovementBarChart from "../components/dashboard2/KwhImprovementBarChart";
import ConsumptionDistributionChart from "../components/dashboard2/ConsumptionDistributionChart";
import FireplaceIcon from "@mui/icons-material/Fireplace";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const Dashboard2 = () => {
  const navigate = useNavigate();
  const furnaceSelected = useSelector((state) => state.hornos2.selectedFurnace);
  const filteredData = useSelector(
    (state) => state.hornos2.furnaceDataFiltered
  );

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card sx={{ margin: 2, padding: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <FireplaceIcon fontSize="large" />
              <Typography
                variant="h5"
                component="div"
                sx={{ marginLeft: 2, fontWeight: "bold" }}
              >
                {furnaceSelected?.name || "Hornos tipo 2"}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Typography variant="body1" color="text.secondary" sx={{ mr: 2 }}>
                Total de datos cargados:{" "}
                {useSelector((state) => state.hornos2.furnaceData.length)}
              </Typography>
              <ArrowBackIcon
                fontSize="large"
                sx={{ cursor: "pointer" }}
                onClick={handleBack}
              />
            </Box>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <FilterComponent title="Filtrar Coladas" expanded={true} />
      </Grid>

      <Grid item xs={12}>
        <FilteredDataTable />
      </Grid>
      {filteredData && filteredData.length > 1 && (
        <>
          <Grid item xs={12} marginBottom={2}>
            <SteelTemperatureScatterChart />
          </Grid>
          <Grid item xs={12} marginBottom={2}>
            <KwhScatterChart />
          </Grid>
          <Grid item xs={12} marginBottom={2}>
            <KwhImprovementBarChart />
          </Grid>
          <Grid item xs={12} marginBottom={2}>
            <ConsumptionDistributionChart />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default Dashboard2;
