// frontend/src/layouts/resellers/templates/EditReseller.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Import mapping component
import CRAddressSelector from "components/CRAddressSelector";

import API_URL from "config";

// Contexts
import { useResellers } from "contexts/ResellerContext";
import { useAuth } from "contexts/AuthContext";

// List of valid reseller categories (must match backend enum)
const resellerCategories = ["cat1", "cat2", "cat3", "cat4", "cat5"];

function EditReseller() {
  const { id } = useParams(); // Get reseller ID from URL
  const navigate = useNavigate();
  const { getResellerById, updateReseller, loading } = useResellers();
  const { user } = useAuth();

  // Component-specific loading state for initial data fetch
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Form states, initialized to empty or null
  const [currentReseller, setCurrentReseller] = useState(null); // Stores the full reseller object once fetched
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [provincia, setProvincia] = useState("");
  const [canton, setCanton] = useState("");
  const [distrito, setDistrito] = useState("");
  const [resellerCategory, setResellerCategory] = useState("");

  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Access control: Only 'Administrador' and 'Editor' can edit resellers
  const canEditReseller = user?.role === "Administrador" || user?.role === "Editor";

  // Effect to fetch reseller data when component mounts or ID changes
  useEffect(() => {
    const fetchReseller = async () => {
      setInitialDataLoading(true);
      setFetchError(null);
      try {
        const data = await getResellerById(id); // Use context function to fetch
        if (data) {
          setCurrentReseller(data); // Store the full data
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setEmail(data.email || "");
          setPhoneNumber(data.phoneNumber || "");
          setAddress(data.address || "");
          setProvincia(data.provincia || "");
          setCanton(data.canton || "");
          setDistrito(data.distrito || "");
          setResellerCategory(data.resellerCategory || "");
        } else {
          setFetchError("Revendedor no encontrado.");
          toast.error("Revendedor no encontrado.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del revendedor.");
        toast.error(err.message || "Error al cargar los detalles del revendedor.");
        console.error("Error fetching reseller:", err);
      } finally {
        setInitialDataLoading(false);
      }
    };

    if (id) {
      fetchReseller();
    }
  }, [id, getResellerById]);

  // Fetch electronic invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      setInvoicesLoading(true);
      try {
        const token = user?.token;
        if (!token) return;

        const response = await fetch(`${API_URL}/api/electronic-invoices/user/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
        }
      } catch (err) {
        console.error("Error fetching electronic invoices:", err);
      } finally {
        setInvoicesLoading(false);
      }
    };
    if (id) {
      fetchInvoices();
    }
  }, [id, user?.token]);

  // Function to check if any changes have been made to enable/disable the save button
  const hasChanges = useCallback(() => {
    if (!currentReseller) return false; // No current data, so no changes to compare

    return (
      firstName !== currentReseller.firstName ||
      lastName !== currentReseller.lastName ||
      email !== currentReseller.email ||
      phoneNumber !== currentReseller.phoneNumber ||
      address !== currentReseller.address ||
      provincia !== currentReseller.provincia ||
      canton !== currentReseller.canton ||
      distrito !== currentReseller.distrito ||
      resellerCategory !== currentReseller.resellerCategory
    );
  }, [
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    provincia,
    canton,
    distrito,
    resellerCategory,
    currentReseller,
  ]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic client-side validation
    if (!firstName || !lastName || !email || !resellerCategory) {
      toast.error("Por favor, complete todos los campos obligatorios.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    if (!resellerCategories.includes(resellerCategory)) {
      toast.error("Categoría de revendedor inválida.");
      return;
    }

    // Prepare updated data
    const updatedData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      provincia,
      canton,
      distrito,
      resellerCategory,
    };

    try {
      const success = await updateReseller(id, updatedData);
      if (success) {
        // Navigating back to reseller list, or reseller details if you create one
        navigate("/revendedores");
      }
    } catch (error) {
      console.error("Failed to update reseller in component:", error);
      // Toast message already handled by context
    }
  };

  // Memoize table headers and rows for electronic invoices
  const invoicesTableData = useMemo(
    () => ({
      columns: [
        { Header: "Fecha", accessor: "date", align: "left" },
        { Header: "Tipo", accessor: "type", align: "left" },
        { Header: "Total", accessor: "total", align: "center" },
        { Header: "Estado", accessor: "status", align: "center" },
        { Header: "Consecutivo", accessor: "consecutivo", align: "center" },
        { Header: "Clave", accessor: "clave", align: "center" },
      ],
      rows: invoices.map((inv) => ({
        date: new Date(inv.fechaEmision).toLocaleString("es-CR"),
        type: inv.tipoDocumento === "01" ? "Factura Electrónica" : "Tiquete Electrónico",
        total: `₡${inv.totalComprobante?.toLocaleString("es-CR")}`,
        status: (
          <MDTypography
            variant="caption"
            color={inv.estado === "error" ? "error" : "success"}
            fontWeight="medium"
          >
            {inv.estado.toUpperCase()}
          </MDTypography>
        ),
        consecutivo: inv.consecutivo || "N/A",
        clave: inv.clave ? (
          <MDTypography
            variant="caption"
            sx={{ wordBreak: "break-all", display: "block", maxWidth: "150px" }}
          >
            {inv.clave}
          </MDTypography>
        ) : (
          "N/A"
        ),
      })),
    }),
    [invoices]
  );

  // Show loading spinner for initial data fetch
  if (initialDataLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando detalles del revendedor...
          </MDTypography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  // Show error if initial data fetch failed or reseller not found
  if (fetchError) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h5" color="error" gutterBottom>
            Error: {fetchError}
          </MDTypography>
          <MDButton
            onClick={() => navigate("/revendedores")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Volver a Revendedores
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Access denied for unauthorized roles
  if (!canEditReseller) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h5" color="error" gutterBottom>
            Acceso Denegado
          </MDTypography>
          <MDTypography variant="body1" color="text">
            No tienes permiso para editar clientes.
          </MDTypography>
          <MDButton
            onClick={() => navigate("/dashboard")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Volver al Dashboard
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox
                variant="gradient"
                borderRadius="lg"
                mx={2}
                mt={-3}
                py={3}
                px={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  background: "linear-gradient(135deg, #9b2fbe 0%, #c471ed 50%, #e056a0 100%)",
                  boxShadow: "0 4px 20px rgba(180, 60, 160, 0.5)",
                }}
              >
                <MDTypography variant="h6" color="white">
                  Editar Cliente: {currentReseller?.firstName} {currentReseller?.lastName}
                </MDTypography>
              </MDBox>
              <MDBox p={3} component="form" role="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nombre"
                      variant="outlined"
                      fullWidth
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Apellido"
                      variant="outlined"
                      fullWidth
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Correo Electrónico"
                      type="email"
                      variant="outlined"
                      fullWidth
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Número de Teléfono"
                      variant="outlined"
                      fullWidth
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box mt={2} mb={2}>
                      <MDTypography variant="h6" fontWeight="medium">
                        Dirección de Entrega
                      </MDTypography>
                    </Box>
                    <CRAddressSelector
                      provincia={provincia}
                      setProvincia={setProvincia}
                      canton={canton}
                      setCanton={setCanton}
                      distrito={distrito}
                      setDistrito={setDistrito}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Dirección Exacta (Otras Señas)"
                      variant="outlined"
                      fullWidth
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Categoría de Revendedor"
                      value={resellerCategory}
                      onChange={(e) => setResellerCategory(e.target.value)}
                      variant="outlined"
                      required
                    >
                      <MenuItem value="">
                        <em>-- Selecciona una Categoría --</em>
                      </MenuItem>
                      {resellerCategories.map((category, index) => (
                        <MenuItem key={category} value={category}>
                          Nivel {index + 1}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
                <MDBox mt={4} mb={1} display="flex" justifyContent="flex-end">
                  <MDButton
                    type="submit"
                    variant="gradient"
                    color="info"
                    disabled={loading || !hasChanges()} // Disable if API is loading or no changes
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/revendedores")}
                    disabled={loading}
                    sx={{ ml: 2 }}
                  >
                    Cancelar
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox
                mx={2}
                mt={1}
                py={3}
                px={2}
                variant="gradient"
                bgColor="success"
                borderRadius="lg"
                coloredShadow="success"
              >
                <MDTypography variant="h6" color="white">
                  Facturas Electrónicas
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {invoicesLoading ? (
                  <MDBox display="flex" justifyContent="center">
                    <CircularProgress color="info" />
                  </MDBox>
                ) : (
                  <DataTable
                    table={invoicesTableData}
                    isSorted={false}
                    entriesPerPage={true}
                    showTotalEntries={true}
                    noEndBorder
                  />
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

export default EditReseller;
