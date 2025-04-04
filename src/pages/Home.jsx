import { useState } from "react";

// eslint-disable-next-line react/prop-types
const HomeCard = ({ title, description, svgSize, route }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.location.href = route;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        height: "60vh",
        flex: 1,
        margin: "0 16px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
        backgroundColor: "white",
        boxShadow: isHovered
          ? "0 12px 20px rgba(0, 0, 0, 0.15)"
          : "0 2px 10px rgba(0, 0, 0, 0.1)",
        border: isHovered ? "2px solid #0200d0" : "1px solid #e0e0e0",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <img
        src={
          isHovered
            ? "./assets/images/pit-furnace-color.svg"
            : "./assets/images/pit-furnace-gray.svg"
        }
        alt={`${title} icon`}
        style={{
          width: svgSize,
          height: svgSize,
          marginBottom: "24px",
          transition: "all 0.3s ease",
        }}
      />

      <h2
        style={{
          fontWeight: isHovered ? "bold" : "500",
          color: isHovered ? "#0200d0" : "#333333",
          transition: "all 0.3s ease",
          fontSize: "28px",
          marginBottom: "16px",
        }}
      >
        {title}
      </h2>

      <h3
        style={{
          color: isHovered ? "#0035b0" : "#666666",
          transition: "all 0.3s ease",
          fontSize: "20px",
          margin: 0,
        }}
      >
        {description}
      </h3>
    </div>
  );
};

const Home = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 136px)",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 32px",
        backgroundColor: "#e1e6ed",
      }}
    >
      <HomeCard
        title="Hornos PIT"
        description=""
        svgSize={250}
        route="/Hornos1"
      />

      <HomeCard
        title="Horno EAF"
        description=""
        svgSize={250}
        route="/Hornos2"
      />
    </div>
  );
};

export default Home;
