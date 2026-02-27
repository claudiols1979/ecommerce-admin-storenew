import React, { useState, useEffect } from "react";
import { Grid, Card, Divider, CircularProgress } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import TokenIcon from "@mui/icons-material/Token";
import axios from "axios";
import { toast } from "react-toastify";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import config from "../../config";

function ChatAnalytics() {
  const [stats, setStats] = useState({ totalChats: 0, totalTokens: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const token = user?.token;

      const [statsRes, logsRes] = await Promise.all([
        axios.get(`${config}/api/chat/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${config}/api/chat/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      toast.error("Error al cargar datos de chat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { Header: "Usuario", accessor: "user", width: "25%" },
    { Header: "Sesión", accessor: "sessionId", width: "20%" },
    { Header: "Tokens", accessor: "tokensUsed", width: "15%" },
    { Header: "Fecha", accessor: "createdAt", width: "20%" },
    { Header: "Mensajes", accessor: "count", width: "10%" },
  ];

  const rows = logs.map((log) => ({
    user: log.user ? `${log.user.firstName} ${log.user.lastName}` : "Visitante",
    sessionId: log.sessionId,
    tokensUsed: log.tokensUsed,
    createdAt: new Date(log.createdAt).toLocaleString(),
    count: log.messages.length,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <MDBox p={3} display="flex" alignItems="center">
                <MDBox
                  variant="gradient"
                  bgColor="info"
                  color="white"
                  coloredShadow="info"
                  borderRadius="xl"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  width="4rem"
                  height="4rem"
                  mr={2}
                >
                  <ChatIcon fontSize="medium" />
                </MDBox>
                <MDBox>
                  <MDTypography variant="button" color="text" fontWeight="regular">
                    Total de Conversaciones
                  </MDTypography>
                  <MDTypography variant="h4">{stats.totalChats}</MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <MDBox p={3} display="flex" alignItems="center">
                <MDBox
                  variant="gradient"
                  bgColor="success"
                  color="white"
                  coloredShadow="success"
                  borderRadius="xl"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  width="4rem"
                  height="4rem"
                  mr={2}
                >
                  <TokenIcon fontSize="medium" />
                </MDBox>
                <MDBox>
                  <MDTypography variant="button" color="text" fontWeight="regular">
                    Tokens Consumidos
                  </MDTypography>
                  <MDTypography variant="h4">{stats.totalTokens}</MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDButton
              variant="gradient"
              color="info"
              fullWidth
              onClick={fetchData}
              sx={{ height: "100%" }}
            >
              Actualizar Datos
            </MDButton>
          </Grid>
        </Grid>

        <MDBox mt={4}>
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
                Logs de Conversaciones Recientes
              </MDTypography>
            </MDBox>
            <MDBox pt={3}>
              {loading ? (
                <MDBox p={3} display="flex" justifyContent="center">
                  <CircularProgress color="info" />
                </MDBox>
              ) : (
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              )}
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ChatAnalytics;
