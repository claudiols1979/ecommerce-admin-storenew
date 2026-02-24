// frontend/src/layouts/orders/templates/OrderDetail.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types"; // Import PropTypes for validation

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge"; // Assuming MDBadge is used for status display
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useOrders } from "contexts/OrderContext";
import { useAuth } from "contexts/AuthContext"; // To determine user role for permissions

// Status Translations
const statusTranslations = {
  pending: "Pendiente",
  placed: "Realizado",
  cancelled: "Cancelado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
};

// Helper component for Order Status Badge
const OrderStatusBadge = ({ status }) => {
  const badgeText = statusTranslations[status] || status;
  let badgeColor;
  switch (status) {
    case "pending":
    case "placed":
      badgeColor = "info";
      break;
    case "processing":
      badgeColor = "warning";
      break;
    case "shipped":
    case "delivered":
      badgeColor = "success";
      break;
    case "cancelled":
      badgeColor = "error";
      break;
    default:
      badgeColor = "dark";
  }

  return <MDBadge badgeContent={badgeText} color={badgeColor} variant="gradient" size="md" />;
};

// Add PropTypes for OrderStatusBadge
OrderStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, loading: orderLoading } = useOrders();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Determine the reseller category for pricing display
  // This might not be directly relevant for OrderDetail if prices are stored with the order,
  // but keeping it here for consistency if needed for future features.
  const currentResellerCategory = user?.role === "Revendedor" ? user.resellerCategory : "cat1";

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setInitialLoadComplete(false);
        setFetchError(null);
        if (typeof getOrderById !== "function") {
          throw new Error("Function to get order by ID is not available.");
        }
        const fetchedOrder = await getOrderById(id);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        } else {
          setFetchError("Detalles del pedido no encontrados.");
          toast.error("Detalles del pedido no encontrados.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del pedido.");
        toast.error(err.message || "Error al cargar los detalles del pedido.");
        console.error("Error fetching order details:", err);
      } finally {
        setInitialLoadComplete(true);
      }
    };

    if (id) {
      fetchOrderData();
    }
  }, [id, getOrderById]);

  const shippingDetails = order?.customerDetails || {};
  const currentProvince = shippingDetails.province || shippingDetails.provincia;
  const currentCity = shippingDetails.city || shippingDetails.canton;

  const GAM_CANTONS = {
    "san jose": [
      "central",
      "escazu",
      "desamparados",
      "aserri",
      "mora",
      "goicoechea",
      "santa ana",
      "alajuelita",
      "vazquez de coronado",
      "tibas",
      "moravia",
      "montes de oca",
      "curridabat",
      "puriscal",
    ],
    alajuela: [
      "central",
      "atenas",
      "grecia",
      "naranjo",
      "palmares",
      "poas",
      "orotina",
      "sarchi",
      "zarcero",
    ],
    cartago: ["central", "paraiso", "la union", "jimenez", "alvarado", "oreamuno", "el guarco"],
    heredia: [
      "central",
      "barva",
      "santo domingo",
      "santa barbara",
      "san rafael",
      "san isidro",
      "belen",
      "flores",
      "san pablo",
    ],
  };

  const normalize = (str) =>
    str
      ? str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
      : "";

  const isGAM = (prov, cant) => {
    if (!prov || !cant) return false;
    const nProv = normalize(prov);
    const nCant = normalize(cant);
    const gamProv = GAM_CANTONS[nProv];
    return gamProv ? gamProv.includes(nCant) : false;
  };

  const calculateShippingFee = (prov, cant, items) => {
    if (!prov || !cant) return 0;
    const totalWeight = items.reduce(
      (sum, item) => sum + item.quantity * (item.product?.weight || 100),
      0
    );
    const inGAM = isGAM(prov, cant);
    const tariffs = [
      { maxW: 250, gam: 1850, resto: 2150 },
      { maxW: 500, gam: 1950, resto: 2500 },
      { maxW: 1000, gam: 2350, resto: 3450 },
    ];
    const rate = tariffs.find((t) => totalWeight <= t.maxW);

    if (rate) {
      return inGAM ? rate.gam : rate.resto;
    } else {
      // Dynamic formula for weight > 1000g
      const base1kg = inGAM ? 2350 : 3450;
      const extraKiloRate = 1100;
      const totalKilos = totalWeight / 1000;
      const extraKilos = Math.ceil(totalKilos - 1);
      return base1kg + extraKilos * extraKiloRate;
    }
  };

  const displayBreakdown =
    order &&
    order.status !== "pending" &&
    order.taxBreakdown &&
    order.taxBreakdown.itemsSubtotal > 0
      ? order.taxBreakdown
      : (() => {
          if (!order)
            return { itemsSubtotal: 0, itemsTax: 0, shippingBase: 0, shippingTax: 0, total: 0 };

          // Calculate items subtotal and tax (Dynamic)
          const iSubtotal = order.items.reduce(
            (acc, item) => acc + item.quantity * item.priceAtSale,
            0
          );
          const iTax = order.items.reduce((acc, item) => {
            const iva =
              parseFloat(item.product?.iva) !== undefined && item.product?.iva !== ""
                ? parseFloat(item.product?.iva)
                : 13;
            return acc + Math.round(item.quantity * item.priceAtSale * (iva / 100));
          }, 0);

          let sBase = 0;
          let sTax = 0;

          // Determine shipping
          if (order.status === "pending") {
            sBase = calculateShippingFee(currentProvince, currentCity, order.items);
            sTax = Math.round(sBase * 0.13);
          } else {
            // Old orders get the fixed 3000/390 fallback
            sBase = 3000;
            sTax = 390;
          }

          const calculatedTotal = iSubtotal + iTax + sBase + sTax;

          return {
            itemsSubtotal: iSubtotal,
            itemsTax: iTax,
            shippingBase: sBase,
            shippingTax: sTax,
            total: calculatedTotal,
          };
        })();

  if (!initialLoadComplete || orderLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando datos del pedido...
          </MDTypography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  if (fetchError || !order) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <MDTypography variant="h5" color="error">
            Error: {fetchError}
          </MDTypography>
          <MDButton
            onClick={() => navigate("/orders")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Volver a Pedidos
          </MDButton>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  const isEditable = ["pending", "placed", "processing"].includes(order.status);
  // Assuming 'approvedBy' exists on the order if an admin/editor has processed it
  const approvedByAdmin = order.approvedBy
    ? `${order.approvedBy.firstName} ${order.approvedBy.lastName}`
    : "N/A";

  const fullAddress = [
    order.customerDetails?.provincia || order.customerDetails?.province,
    order.customerDetails?.canton || order.customerDetails?.city,
    order.customerDetails?.distrito,
    order.customerDetails?.address,
  ]
    .filter((part) => part && part !== "N/A")
    .join(", ");

  const handlePrintLabel = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Etiqueta de Envío</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
            .label-container { 
              border: 2px solid #000; 
              width: 400px; 
              padding: 20px; 
              border-radius: 10px;
              margin: 0 auto;
            }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .content p { margin: 8px 0; font-size: 16px; font-weight: bold; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .footer { margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="header">
              <div class="title">ETIQUETA DE ENVÍO</div>
              <div>Pedido #${order.orderNumber || order._id}</div>
              <div>Fecha: ${new Date(order.createdAt).toLocaleDateString("es-CR")}</div>
            </div>
            <div class="content">
              <p>DESTINATARIO: <br/><span style="font-weight: normal; font-size: 18px;">${
                order.customerDetails?.name || "N/A"
              }</span></p>
              <p>TELÉFONO: <br/><span style="font-weight: normal; font-size: 18px;">${
                order.customerDetails?.phoneNumber || "N/A"
              }</span></p>
              <p>UBICACIÓN: <br/><span style="font-weight: normal; font-size: 16px;">${
                [
                  order.customerDetails?.provincia || order.customerDetails?.province,
                  order.customerDetails?.canton || order.customerDetails?.city,
                  order.customerDetails?.distrito,
                ]
                  .filter((p) => p && p !== "N/A")
                  .join(", ") || "N/A"
              }</span></p>
              <p>DIRECCIÓN EXACTA: <br/><span style="font-weight: normal; font-size: 16px;">${
                order.customerDetails?.address || "N/A"
              }</span></p>
            </div>
            <div class="footer">
              Enviado a través de nuestra red de logística.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={10}>
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
                  Detalles del Pedido: {order.orderNumber || order._id}
                </MDTypography>
                <MDBox display="flex" alignItems="center">
                  <MDButton
                    onClick={handlePrintLabel}
                    variant="gradient"
                    color="primary"
                    sx={{ mr: 1 }}
                    startIcon={<LocalPrintshopIcon />}
                  >
                    Imprimir Etiqueta
                  </MDButton>
                  {isEditable && (user?.role === "Administrador" || user?.role === "Editor") && (
                    <MDButton
                      onClick={() => navigate(`/orders/edit/${order._id}`)}
                      variant="gradient"
                      color="warning"
                      sx={{ mr: 1 }}
                    >
                      Ver Pedido
                    </MDButton>
                  )}
                  <MDButton onClick={() => navigate("/orders")} variant="gradient" color="dark">
                    Volver a todos los Pedidos
                  </MDButton>
                </MDBox>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  {/* Order Details */}
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="h6" mb={1}>
                      Información del Pedido:
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Número de Pedido:
                      </MDTypography>{" "}
                      {order.orderNumber || order._id}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Fecha del Pedido:
                      </MDTypography>{" "}
                      {new Date(order.createdAt).toLocaleDateString("es-CR")}
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold" mr={1}>
                        Estado:
                      </MDTypography>{" "}
                      <OrderStatusBadge status={order.status} /> {/* Use the helper component */}
                    </MDBox>
                    <MDBox mt={2}>
                      <MDTypography variant="h6" mb={1}>
                        Desglose de Pago:
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mb={0.5}>
                        Subtotal Productos:{" "}
                        {Math.round(displayBreakdown.itemsSubtotal).toLocaleString("es-CR", {
                          style: "currency",
                          currency: "CRC",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mb={0.5}>
                        IVA Productos (13%):{" "}
                        {Math.round(displayBreakdown.itemsTax).toLocaleString("es-CR", {
                          style: "currency",
                          currency: "CRC",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mb={0.5}>
                        Envío (Correos de CR):{" "}
                        {Math.round(displayBreakdown.shippingBase).toLocaleString("es-CR", {
                          style: "currency",
                          currency: "CRC",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mb={0.5}>
                        IVA Envío (13%):{" "}
                        {Math.round(displayBreakdown.shippingTax).toLocaleString("es-CR", {
                          style: "currency",
                          currency: "CRC",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </MDTypography>
                      <MDBox mt={1} pt={1} borderTop="1px solid #eee">
                        <MDTypography variant="h6">
                          Total Pagado:{" "}
                          {Math.round(displayBreakdown.total).toLocaleString("es-CR", {
                            style: "currency",
                            currency: "CRC",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Realizado por:
                      </MDTypography>{" "}
                      {order.user?.firstName} {order.user?.lastName} ({order.user?.email})
                    </MDTypography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <MDTypography variant="h6" mb={1}>
                      Detalles del Cliente Final:
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Nombre:
                      </MDTypography>{" "}
                      {order.customerDetails?.name}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Teléfono:
                      </MDTypography>{" "}
                      {order.customerDetails?.phoneNumber}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Ubicación:
                      </MDTypography>{" "}
                      {order.customerDetails?.provincia || order.customerDetails?.province || "N/A"}
                      , {order.customerDetails?.canton || order.customerDetails?.city || "N/A"},{" "}
                      {order.customerDetails?.distrito || "N/A"}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Dirección Exacta:
                      </MDTypography>{" "}
                      {order.customerDetails?.address || "N/A"}
                    </MDTypography>
                  </Grid>

                  {/* Order Items */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={2}>
                      Artículos del Pedido ({order.items.length}):
                    </MDTypography>
                    {order.items.length === 0 ? (
                      <MDTypography variant="body2" color="text">
                        No hay productos en este pedido.
                      </MDTypography>
                    ) : (
                      <MDBox>
                        {order.items.map((item) => (
                          <MDBox
                            key={item.product?._id || item._id}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            mb={1}
                            p={1}
                            borderBottom="1px solid #eee"
                          >
                            <MDBox display="flex" alignItems="center">
                              <MDBox
                                component="img"
                                src={
                                  item.product?.imageUrls?.[0]?.secure_url ||
                                  `https://placehold.co/40x40/cccccc/000000?text=${
                                    item.code || "Item"
                                  }`
                                }
                                alt={item.name || "Item"}
                                sx={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "md",
                                  mr: 1.5,
                                }}
                              />
                              <MDTypography variant="button" fontWeight="medium">
                                {item.name} (Cód: {item.code}) - {item.quantity} x{" "}
                                {Math.round(item.priceAtSale).toLocaleString("es-CR", {
                                  style: "currency",
                                  currency: "CRC",
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })}
                              </MDTypography>
                            </MDBox>
                            <MDTypography variant="button" fontWeight="medium">
                              Subtotal sin iva:{" "}
                              {Math.round(item.quantity * item.priceAtSale).toLocaleString(
                                "es-CR",
                                {
                                  style: "currency",
                                  currency: "CRC",
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }
                              )}
                            </MDTypography>
                          </MDBox>
                        ))}
                      </MDBox>
                    )}
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default OrderDetail;
