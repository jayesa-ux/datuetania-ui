import { Grid, Typography, Card } from "@mui/material";
import { useSelector } from "react-redux";
import ChartDataTable from "../components/dashboard1/ChartDataTable";
import ChartFurnace from "../components/dashboard1/ChartFurnace";
import ChartFilter from "../components/dashboard1/ChartFilter";
import FireplaceIcon from "@mui/icons-material/Fireplace";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const Dashboard1 = () => {
  const navigate = useNavigate();
  const furnaceSelected = useSelector((state) => state.furnace.selectedFurnace);

  const handleBack = () => {
    navigate(-1);
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
              <Typography variant="h5" component="div" sx={{ marginLeft: 2 }}>
                {furnaceSelected.name}
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
      <Grid item xs={12} sx={{ marginBottom: 2 }}>
        <ChartFilter />
      </Grid>
      <Grid item xs={12} sx={{ marginX: 2, marginBottom: 2 }}>
        <ChartDataTable />
      </Grid>
      <Grid item xs={12} sx={{ marginX: 2, marginBottom: 2 }}>
        <ChartFurnace />
      </Grid>
    </Grid>
  );
};

export default Dashboard1;
