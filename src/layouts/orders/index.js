import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import ordersTableData from "./data/ordersTableData";

// Contexts
import { useAuth } from "contexts/AuthContext";
import { useOrders } from "contexts/OrderContext";

function Orders() {
  const { user } = useAuth();
  const {
    orders,
    loading,
    error,
    fetchOrders,
    currentPage,
    totalPages,
    totalOrders,
    changeOrderStatus,
    cleanupPendingOrders,
  } = useOrders();

  // Local state for controlling the UI and API queries
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("createdAt_desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPending, setShowPending] = useState(() => {
    return localStorage.getItem("orders-show-pending") === "true";
  });

  // Cleanup Modal state
  const [openCleanup, setOpenCleanup] = useState(false);
  const [cleanupDates, setCleanupDates] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [isCleaning, setIsCleaning] = useState(false);

  // Sync showPending to localStorage
  useEffect(() => {
    localStorage.setItem("orders-show-pending", showPending);
  }, [showPending]);

  useEffect(() => {
    fetchOrders(page, limit, sort, searchTerm, !showPending);
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing dashboard data...");
      fetchOrders(page, limit, sort, searchTerm, !showPending);
    }, 30000); // 30000 milliseconds = 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchOrders, page, limit, sort, searchTerm, showPending]);

  // Main data fetching effect removed as it's redundant with the one above

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = useCallback(() => {
    if (page !== 1) {
      setPage(1);
    }
    fetchOrders(1, limit, sort, searchTerm, !showPending);
  }, [limit, sort, searchTerm, fetchOrders, page, showPending]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleTogglePending = (event) => {
    setShowPending(event.target.checked);
    setPage(1);
  };

  const handleCleanupSubmit = async () => {
    if (!cleanupDates.start || !cleanupDates.end) {
      toast.error("Por favor, seleccione ambas fechas.");
      return;
    }
    setIsCleaning(true);
    try {
      const result = await cleanupPendingOrders(cleanupDates.start, cleanupDates.end);
      toast.success(result.message);
      setOpenCleanup(false);
      fetchOrders(page, limit, sort, searchTerm, !showPending);
    } catch (err) {
      toast.error(err.message || "Error al limpiar carritos.");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleStatusChange = useCallback(
    async (orderId, newStatus) => {
      try {
        await changeOrderStatus(orderId, newStatus);
        toast.success(`Estado del pedido cambiado.`);
        fetchOrders(page, limit, sort, searchTerm, !showPending);
      } catch (err) {
        toast.error(err.message || "Error al cambiar el estado del pedido.");
      }
    },
    [page, limit, sort, searchTerm, changeOrderStatus, fetchOrders]
  );

  const { columns, rows } = useMemo(
    () => ordersTableData(orders, user, handleStatusChange),
    [orders, user, handleStatusChange]
  );

  if (loading && orders.length === 0) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando pedidos...
          </MDTypography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h5" color="error">
            {error.message}
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Pedidos
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {/* ==================================================================== */}
                {/* AQUÍ COMIENZA EL BLOQUE DE FILTROS RESPONSIVO (ÚNICO CAMBIO)         */}
                {/* Se usa Grid para que los filtros se apilen en pantallas pequeñas    */}
                {/* ==================================================================== */}
                <MDBox px={3} mb={3}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Buscar Pedido"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        onKeyPress={handleKeyPress}
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleSearch} edge="end">
                                <Icon>search</Icon>
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        select
                        variant="outlined"
                        fullWidth
                        value={sort}
                        onChange={handleSortChange}
                        label="Ordenar Por"
                      >
                        <MenuItem value="createdAt_desc">Fecha (Más Reciente)</MenuItem>
                        <MenuItem value="createdAt_asc">Fecha (Más Antigua)</MenuItem>
                        <MenuItem value="totalPrice_desc">Total (Mayor a Menor)</MenuItem>
                        <MenuItem value="totalPrice_asc">Total (Menor a Mayor)</MenuItem>
                        <MenuItem value="status_asc">Estado (A-Z)</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <TextField
                        select
                        variant="outlined"
                        fullWidth
                        value={limit}
                        onChange={handleLimitChange}
                        label="Mostrar"
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={8} md={3}>
                      <MDBox display="flex" justifyContent="space-around" alignItems="center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showPending}
                              onChange={handleTogglePending}
                              color="info"
                            />
                          }
                          label={
                            <MDTypography variant="button" fontWeight="medium" color="text">
                              Mostrar Carritos (Pendientes)
                            </MDTypography>
                          }
                        />
                        <MDButton
                          variant="gradient"
                          color="error"
                          size="small"
                          startIcon={<DeleteSweepIcon />}
                          onClick={() => setOpenCleanup(true)}
                        >
                          Limpiar Carritos
                        </MDButton>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
                {/* ==================================================================== */}
                {/* AQUÍ TERMINA EL BLOQUE DE FILTROS RESPONSIVO                         */}
                {/* ==================================================================== */}

                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  noEndBorder
                  entriesPerPage={false}
                  showTotalEntries={false}
                  canSearch={false}
                />

                <MDBox display="flex" justifyContent="center" alignItems="center" p={3}>
                  {totalPages > 1 && (
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="info"
                    />
                  )}
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="left" p={2}>
                  <MDTypography variant="caption" color="text">
                    {`Mostrando ${rows.length} de ${totalOrders} pedidos`}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Cleanup Modal */}
      <Dialog open={openCleanup} onClose={() => !isCleaning && setOpenCleanup(false)}>
        <DialogTitle>Limpieza de Carritos Abandonados</DialogTitle>
        <DialogContent>
          <MDBox pt={2} px={1}>
            <MDTypography variant="body2" color="text" mb={3}>
              Esta acción eliminará todos los pedidos con estado <strong>"Pendiente"</strong> que
              hayan sido creados en el rango de fechas seleccionado. Esta acción{" "}
              <strong>no se puede deshacer</strong>.
            </MDTypography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha Inicio"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={cleanupDates.start}
                  onChange={(e) => setCleanupDates({ ...cleanupDates, start: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha Fin"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={cleanupDates.end}
                  onChange={(e) => setCleanupDates({ ...cleanupDates, end: e.target.value })}
                />
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton
            variant="text"
            color="secondary"
            onClick={() => setOpenCleanup(false)}
            disabled={isCleaning}
          >
            Cancelar
          </MDButton>
          <MDButton
            variant="gradient"
            color="error"
            onClick={handleCleanupSubmit}
            disabled={isCleaning}
          >
            {isCleaning ? <CircularProgress size={24} color="inherit" /> : "Confirmar Eliminación"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Orders;
