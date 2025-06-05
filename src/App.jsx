import Navbar from "./components/layout/Navbar";
import HornosPIT from "./pages/HornosPIT";
import DashboardPIT from "./pages/DashboardPIT";
import HornoEAF from "./pages/HornoEAF";
import DashboardEAF from "./pages/DashboardEAF";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import { CssBaseline, Box } from "@mui/material";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useRef } from "react";
import "./App.css";

function App() {
  const location = useLocation();
  const nodeRef = useRef(null);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <CssBaseline />
      <Navbar />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TransitionGroup>
          <CSSTransition
            key={location.key}
            classNames="fade"
            timeout={300}
            nodeRef={nodeRef}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/HornosPIT" element={<HornosPIT />} />
              <Route path="/DashboardPIT" element={<DashboardPIT />} />
              <Route path="/HornoEAF" element={<HornoEAF />} />
              <Route path="/DashboardEAF" element={<DashboardEAF />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </Box>
      <Footer />
    </Box>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
