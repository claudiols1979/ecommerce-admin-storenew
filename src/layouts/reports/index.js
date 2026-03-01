import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

import API_URL from "../../config";

function Reports() {
  const [filter, setFilter] = useState("month");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const storedUser = localStorage.getItem("user");
      const token = storedUser ? JSON.parse(storedUser).token : "";

      const response = await axios.get(`${API_URL}/api/reports/profit?period=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReportData(response.data);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.response?.data?.message || "Error al cargar el reporte.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const formatCurrency = (amount) => `₡${Math.round(amount || 0).toLocaleString("es-CR")}`;

  const renderStats = () => {
    if (!reportData) return null;
    const { summary } = reportData;
    const profitMargin =
      summary.revenue > 0 ? ((summary.profit / summary.revenue) * 100).toFixed(1) : 0;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="dark"
              icon="payments"
              title="Ventas Totales"
              count={formatCurrency(summary.revenue)}
              percentage={{
                label: `Ventas en el periodo (${filter})`,
              }}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              icon="shopping_basket"
              title="Costo de Ventas"
              count={formatCurrency(summary.cost)}
              percentage={{
                label: "Costo total de productos vendidos",
              }}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="success"
              icon="trending_up"
              title="Utilidad Neta"
              count={formatCurrency(summary.profit)}
              percentage={{
                color: "success",
                amount: `${profitMargin}%`,
                label: "Margen de utilidad",
              }}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="primary"
              icon="receipt_long"
              title="Órdenes"
              count={summary.ordersCount}
              percentage={{
                label: "Total de pedidos realizados",
              }}
            />
          </MDBox>
        </Grid>
      </Grid>
    );
  };

  const renderOrdersTable = () => {
    if (!reportData || !reportData.orders) return null;

    return (
      <Card sx={{ mt: 3 }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
          <MDTypography variant="h6">Detalle de Órdenes en el Periodo</MDTypography>
        </MDBox>
        <MDBox pb={3}>
          <TableContainer>
            <Table>
              <TableHead sx={{ display: "table-header-group" }}>
                <TableRow>
                  <TableCell>
                    <MDTypography variant="caption" color="secondary" fontWeight="bold">
                      # Pedido
                    </MDTypography>
                  </TableCell>
                  <TableCell>
                    <MDTypography variant="caption" color="secondary" fontWeight="bold">
                      Fecha
                    </MDTypography>
                  </TableCell>
                  <TableCell>
                    <MDTypography variant="caption" color="secondary" fontWeight="bold">
                      Monto
                    </MDTypography>
                  </TableCell>
                  <TableCell>
                    <MDTypography variant="caption" color="secondary" fontWeight="bold">
                      Costo
                    </MDTypography>
                  </TableCell>
                  <TableCell>
                    <MDTypography variant="caption" color="secondary" fontWeight="bold">
                      Utilidad
                    </MDTypography>
                  </TableCell>
                  <TableCell>
                    <MDTypography variant="caption" color="secondary" fontWeight="bold">
                      Estado
                    </MDTypography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <MDTypography variant="button" fontWeight="medium">
                        {order.orderNumber || order._id.substring(18)}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="caption" color="text" fontWeight="medium">
                        {new Date(order.createdAt).toLocaleDateString("es-CR")}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="caption" color="text" fontWeight="medium">
                        {formatCurrency(order.totalPrice)}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="caption" color="text" fontWeight="medium">
                        {formatCurrency(order.totalCost)}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="caption" color="success" fontWeight="bold">
                        {formatCurrency(
                          order.totalProfit != null
                            ? order.totalProfit
                            : (order.totalPrice || 0) - (order.totalCost || 0)
                        )}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="caption" color="text" fontWeight="medium">
                        {order.status}
                      </MDTypography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MDBox>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Reporte de Utilidades
          </MDTypography>
          <MDBox display="flex" gap={1}>
            <MDButton
              variant={filter === "day" ? "gradient" : "outlined"}
              color="info"
              size="small"
              onClick={() => setFilter("day")}
            >
              Hoy
            </MDButton>
            <MDButton
              variant={filter === "week" ? "gradient" : "outlined"}
              color="info"
              size="small"
              onClick={() => setFilter("week")}
            >
              Semana
            </MDButton>
            <MDButton
              variant={filter === "month" ? "gradient" : "outlined"}
              color="info"
              size="small"
              onClick={() => setFilter("month")}
            >
              Mes
            </MDButton>
            <MDButton
              variant={filter === "year" ? "gradient" : "outlined"}
              color="info"
              size="small"
              onClick={() => setFilter("year")}
            >
              Año
            </MDButton>
          </MDBox>
        </MDBox>

        {loading ? (
          <MDBox display="flex" justifyContent="center" py={5}>
            <CircularProgress color="info" />
          </MDBox>
        ) : error ? (
          <MDBox py={3}>
            <MDTypography color="error" variant="h6">
              {error}
            </MDTypography>
            <MDButton variant="gradient" color="info" onClick={fetchReportData} sx={{ mt: 2 }}>
              Reintentar
            </MDButton>
          </MDBox>
        ) : (
          <>
            {renderStats()}
            {renderOrdersTable()}
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Reports;
