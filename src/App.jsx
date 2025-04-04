import Navbar from "./components/layout/Navbar";
import Hornos1 from "./pages/Hornos1";
import Dashboard1 from "./pages/Dashboard1";
import Hornos2 from "./pages/Hornos2";
import Dashboard2 from "./pages/Dashboard2";
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
              <Route path="/Hornos1" element={<Hornos1 />} />
              <Route path="/Dashboard1" element={<Dashboard1 />} />
              <Route path="/Hornos2" element={<Hornos2 />} />
              <Route path="/Dashboard2" element={<Dashboard2 />} />
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
