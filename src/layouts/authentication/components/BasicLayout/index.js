/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import PageLayout from "examples/LayoutContainers/PageLayout";

// Authentication pages components
import Footer from "layouts/authentication/components/Footer";

function BasicLayout({ image, children }) {
  return (
    <PageLayout>
      <MDBox
        position="absolute"
        width="100%"
        minHeight="100vh"
        sx={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(200, 50, 180, 0.9) 0%, transparent 55%),
            radial-gradient(ellipse 70% 80% at 75% 20%, rgba(90, 50, 220, 0.85) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255, 120, 200, 0.6) 0%, transparent 50%),
            radial-gradient(ellipse 50% 70% at 30% 30%, rgba(100, 100, 255, 0.7) 0%, transparent 45%),
            radial-gradient(ellipse 90% 50% at 80% 70%, rgba(220, 60, 150, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 60% 40%, rgba(255, 200, 255, 0.5) 0%, transparent 40%),
            linear-gradient(135deg, #3a0663 0%, #5b1a8a 30%, #7b2fbe 60%, #4a1080 100%)
          `,
          overflow: "hidden",
          "@keyframes floatOrb1": {
            "0%": { transform: "translate(0, 0) scale(1) rotate(0deg)" },
            "33%": { transform: "translate(60px, -80px) scale(1.2) rotate(120deg)" },
            "66%": { transform: "translate(-40px, 40px) scale(0.8) rotate(240deg)" },
            "100%": { transform: "translate(0, 0) scale(1) rotate(360deg)" },
          },
          "@keyframes floatOrb2": {
            "0%": { transform: "translate(0, 0) scale(1) rotate(0deg)" },
            "33%": { transform: "translate(-60px, 60px) scale(1.3) rotate(-120deg)" },
            "66%": { transform: "translate(50px, -50px) scale(0.7) rotate(-240deg)" },
            "100%": { transform: "translate(0, 0) scale(1) rotate(-360deg)" },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            width: "700px",
            height: "700px",
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            background:
              "radial-gradient(ellipse at center, rgba(220, 40, 160, 0.7) 0%, rgba(180, 30, 200, 0.4) 40%, transparent 70%)",
            top: "-200px",
            right: "-150px",
            animation: "floatOrb1 12s ease-in-out infinite",
            pointerEvents: "none",
            filter: "blur(30px)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%",
            background:
              "radial-gradient(ellipse at center, rgba(80, 60, 230, 0.7) 0%, rgba(120, 80, 255, 0.4) 40%, transparent 70%)",
            bottom: "-150px",
            left: "-120px",
            animation: "floatOrb2 14s ease-in-out infinite",
            pointerEvents: "none",
            filter: "blur(25px)",
          },
        }}
      />
      <MDBox px={1} width="100%" height="100vh" mx="auto" position="relative" zIndex={1}>
        <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
          <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
            {children}
          </Grid>
        </Grid>
      </MDBox>
    </PageLayout>
  );
}

// Typechecking props for the BasicLayout
BasicLayout.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
