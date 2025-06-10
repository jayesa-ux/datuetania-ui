import { Grid, Typography, Card } from "@mui/material";
import { useSelector } from "react-redux";
import FilterComponent from "../components/DashboardEAF/FilterComponent";
import FilteredDataTable from "../components/DashboardEAF/FilteredDataTable";
import SteelTemperatureScatterChart from "../components/DashboardEAF/SteelTemperatureScatterChart";
import KwhScatterChart from "../components/DashboardEAF/KwhScatterChart";
import KwhImprovementBarChart from "../components/DashboardEAF/KwhImprovementBarChart";
import ConsumptionDistributionChart from "../components/DashboardEAF/ConsumptionDistributionChart";
import ScrollToTopButton from "../components/layout/ScrollToTopButton";
import FireplaceIcon from "@mui/icons-material/Fireplace";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const DashboardEAF = () => {
  const navigate = useNavigate();
  const furnaceSelected = useSelector((state) => state.hornos2.selectedFurnace);

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <>
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
                  {furnaceSelected?.name || "Horno EAF"}
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

        <Grid item xs={12}>
          <FilterComponent title="Filtrar Coladas" expanded={true} />
        </Grid>

        <Grid item xs={12}>
          <FilteredDataTable />
        </Grid>
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
      </Grid>
      <ScrollToTopButton />
    </>
  );
};

export default DashboardEAF;
