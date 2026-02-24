import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

const AuthBranding = ({ lightMode = false }) => {
  const textColor = lightMode ? "#ffffff" : "#263C5C";

  return (
    <Box sx={{ my: 4, textAlign: "center" }}>
      <Typography
        variant="h2"
        component="h1"
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 700,
          color: textColor,
          letterSpacing: "0.1em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Software
        <Typography
          component="span"
          variant="h3"
          sx={{
            fontFamily: '"Lato", sans-serif',
            fontWeight: 300,
            fontStyle: "italic",
            mx: 2,
            color: textColor,
          }}
        >
          Factory
        </Typography>
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 1,
          letterSpacing: "0.05em",
          color: lightMode ? "rgba(255,255,255,0.8)" : "#263C5C",
        }}
      >
        ERP
      </Typography>
    </Box>
  );
};

AuthBranding.propTypes = {
  lightMode: PropTypes.bool,
};

export default AuthBranding;
