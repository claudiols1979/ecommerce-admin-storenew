import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useConfig } from "contexts/ConfigContext";

function Administration() {
  const { taxRegime, updateConfig, loading, systemEnv, envLoading } = useConfig();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRegimeChange = async (event) => {
    const newRegime = event.target.checked ? "simplified" : "traditional";
    setIsUpdating(true);
    try {
      await updateConfig("TAX_REGIME", newRegime);
      toast.success(
        `Régimen cambiado a: ${newRegime === "simplified" ? "Simplificado" : "Tradicional"}`
      );
    } catch (error) {
      toast.error("Error al cambiar el régimen fiscal.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Configuración Administrativa
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  centered
                  sx={{ mb: 3, borderBottom: "1px solid #ddd" }}
                >
                  <Tab label="Configuración Fiscal" />
                  <Tab label="Información del Sistema" />
                </Tabs>

                {activeTab === 0 ? (
                  <MDBox>
                    <MDTypography variant="h6" mb={2}>
                      Régimen de Tributación
                    </MDTypography>
                    <MDBox display="flex" flexDirection="column">
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <MDBox>
                          <MDTypography variant="button" fontWeight="bold">
                            Régimen Fiscal Activo
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            {taxRegime === "simplified"
                              ? "Actualmente en Régimen Simplificado (0% IVA, Envío con impuesto incluido)."
                              : "Actualmente en Régimen Tradicional (13% IVA desglosado)."}
                          </MDTypography>
                        </MDBox>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={taxRegime === "simplified"}
                              onChange={handleRegimeChange}
                              disabled={isUpdating || loading}
                              color="info"
                            />
                          }
                          label={
                            <MDTypography variant="button" fontWeight="medium" color="text">
                              {taxRegime === "simplified" ? "Simplificado" : "Tradicional"}
                            </MDTypography>
                          }
                        />
                      </MDBox>
                      <Divider />
                      <MDBox mt={2}>
                        <MDTypography variant="h6" mb={1} color="warning">
                          ¿Qué cambia con el Régimen Simplificado?
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          1. <strong>IVA 0%:</strong> Todos los productos y servicios tendrán un 0%
                          de IVA.
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          2. <strong>Envío Flat:</strong> El costo de envío incluirá el impuesto
                          internamente pero se mostrará como un monto único.
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          3. <strong>Sin Factura Electrónica:</strong> No se enviarán documentos a
                          Hacienda.
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          4. <strong>Ticket Simplificado:</strong> Se generará un comprobante
                          interno para el cliente con la leyenda legal correspondiente.
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                ) : (
                  <MDBox>
                    <MDTypography variant="h6" mb={2}>
                      Variables de Entorno (Solo Lectura)
                    </MDTypography>
                    {envLoading ? (
                      <MDBox display="flex" justifyContent="center" py={3}>
                        <CircularProgress color="info" />
                      </MDBox>
                    ) : systemEnv ? (
                      <MDBox>
                        <MDBox mb={3}>
                          <MDTypography variant="button" fontWeight="bold" color="info">
                            Tilopay (Pasarela de Pagos)
                          </MDTypography>
                          <MDBox ml={2} mt={1}>
                            <SystemVar label="Usuario API" value={systemEnv.tilopay.user} />
                            <SystemVar label="Password API" value={systemEnv.tilopay.password} />
                            <SystemVar label="Key API" value={systemEnv.tilopay.key} />
                            <SystemVar label="URL API" value={systemEnv.tilopay.url} />
                            <SystemVar label="URL Redirección" value={systemEnv.tilopay.redirect} />
                          </MDBox>
                        </MDBox>

                        <Divider />

                        <MDBox mb={3} mt={2}>
                          <MDTypography variant="button" fontWeight="bold" color="info">
                            Su Factura Fácil (Facturación Electrónica)
                          </MDTypography>
                          <MDBox ml={2} mt={1}>
                            <SystemVar label="API URL" value={systemEnv.sff.apiUrl} />
                            <SystemVar label="Key Cliente" value={systemEnv.sff.keyCliente} />
                            <SystemVar label="Key Emisor" value={systemEnv.sff.keyEmisor} />
                          </MDBox>
                        </MDBox>

                        <Divider />

                        <MDBox mb={3} mt={2}>
                          <MDTypography variant="button" fontWeight="bold" color="info">
                            Datos del Emisor (Hacienda)
                          </MDTypography>
                          <MDBox ml={2} mt={1}>
                            <SystemVar label="Nombre/Razón Social" value={systemEnv.company.name} />
                            <SystemVar label="Cédula" value={systemEnv.company.cedula} />
                            <SystemVar
                              label="Código Actividad"
                              value={systemEnv.company.codigoActividad}
                            />
                            <SystemVar label="Dirección" value={systemEnv.company.address} />
                            <SystemVar label="Teléfono" value={systemEnv.company.phone} />
                            <SystemVar label="Email" value={systemEnv.company.email} />
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    ) : (
                      <MDTypography variant="button" color="text">
                        No se pudo cargar la información del sistema.
                      </MDTypography>
                    )}
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

const SystemVar = ({ label, value }) => (
  <MDBox display="flex" justifyContent="space-between" mb={0.5}>
    <MDTypography variant="caption" fontWeight="bold" color="text">
      {label}:
    </MDTypography>
    <MDTypography variant="caption" fontWeight="medium">
      {value || "No configurado"}
    </MDTypography>
  </MDBox>
);

SystemVar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

export default Administration;
