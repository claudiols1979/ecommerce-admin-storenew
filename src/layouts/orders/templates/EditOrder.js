import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import { useTheme, useMediaQuery } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts & Config
import { useOrders } from "contexts/OrderContext";
import { useAuth } from "contexts/AuthContext";
import API_URL from "config";

// Status Translations
const statusTranslations = {
  pending: "Pendiente",
  placed: "Realizado",
  cancelled: "Cancelado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
};

const canModifyOrderItemsStatuses = ["pending", "placed", "processing"];
const canChangeOrderStatusDropdown = ["placed", "processing", "shipped"];

function EditOrder() {
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateOrder, loading: orderLoading } = useOrders();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [order, setOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [initialStatus, setInitialStatus] = useState("");
  const [initialCartItems, setInitialCartItems] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    provincia: "",
    province: "",
    canton: "",
    city: "",
    distrito: "",
  });

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const currentResellerCategory = user?.role === "Revendedor" ? user.resellerCategory : "cat1";
  const areOrderItemsEditable = canModifyOrderItemsStatuses.includes(initialStatus);
  const isStatusDropdownEditable = canChangeOrderStatusDropdown.includes(initialStatus);

  useEffect(() => {
    if (productSearchTerm.trim() === "") {
      setSearchedProducts([]);
      return;
    }
    const authToken = user?.token;
    if (!authToken) return;
    const handler = setTimeout(async () => {
      setProductsLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/products?keyword=${productSearchTerm}&limit=5`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (response.data && Array.isArray(response.data.products)) {
          setSearchedProducts(response.data.products);
        }
      } catch (err) {
        toast.error("Error al buscar productos.");
      } finally {
        setProductsLoading(false);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [productSearchTerm, user?.token]);

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
          setCurrentStatus(fetchedOrder.status);
          setInitialStatus(fetchedOrder.status);
          const mappedItems = fetchedOrder.items.map((item) => {
            const productInfo =
              item.product && typeof item.product === "object" ? item.product : {};

            // If product is not populated but exists in order as ID,
            // the backend SHOULD have populated it.
            const totalStock = (productInfo.countInStock || 0) + item.quantity;

            return {
              product: {
                _id: productInfo._id ? productInfo._id.toString() : item.product,
                name: productInfo.name || item.name, // Use productInfo name if available
                code: productInfo.code || item.code,
                imageUrls: productInfo.imageUrls || [],
                totalStock: totalStock,
                iva:
                  productInfo.iva !== undefined && productInfo.iva !== ""
                    ? productInfo.iva
                    : item.iva || 13,
                weight: productInfo.weight !== undefined ? productInfo.weight : item.weight || 100,
              },
              quantity: item.quantity,
              priceAtSale: item.priceAtSale,
              name: productInfo.name || item.name,
              code: productInfo.code || item.code,
            };
          });
          setCartItems(mappedItems);
          setInitialCartItems(mappedItems);
          setCustomerDetails({
            name: fetchedOrder.customerDetails?.name || "",
            phoneNumber: fetchedOrder.customerDetails?.phoneNumber || "",
            address: fetchedOrder.customerDetails?.address || "",
            provincia:
              fetchedOrder.customerDetails?.province ||
              fetchedOrder.customerDetails?.provincia ||
              "",
            province:
              fetchedOrder.customerDetails?.province ||
              fetchedOrder.customerDetails?.provincia ||
              "",
            canton:
              fetchedOrder.customerDetails?.city || fetchedOrder.customerDetails?.canton || "",
            city: fetchedOrder.customerDetails?.city || fetchedOrder.customerDetails?.canton || "",
            distrito: fetchedOrder.customerDetails?.distrito || "",
          });
        } else {
          throw new Error("Detalles del pedido no encontrados.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del pedido.");
        toast.error(err.message || "Error al cargar los detalles del pedido.");
      } finally {
        setInitialLoadComplete(true);
      }
    };
    if (id) {
      fetchOrderData();
    }
  }, [id, getOrderById]);

  const handleAddToCart = (productToAdd, quantity = 1) => {
    if (!productToAdd) return;
    const existingItem = cartItems.find((item) => item.product._id === productToAdd._id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    if (currentQty + quantity > productToAdd.countInStock) {
      return toast.error(`No hay suficiente stock.`);
    }
    const priceAtSale =
      productToAdd.resellerPrices?.[currentResellerCategory] ||
      productToAdd.resellerPrices?.cat1 ||
      0;
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.product._id === productToAdd._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          product: {
            _id: productToAdd._id.toString(),
            name: productToAdd.name,
            code: productToAdd.code,
            imageUrls: productToAdd.imageUrls,
            totalStock: productToAdd.countInStock, // Aseguramos que el nuevo producto también tenga el stock
            iva: productToAdd.iva !== undefined && productToAdd.iva !== "" ? productToAdd.iva : 13, // CRITICAL: Map IVA
            weight: productToAdd.weight || 100, // CRITICAL: Map weight
          },
          quantity: quantity,
          priceAtSale,
          name: productToAdd.name,
          code: productToAdd.code,
        },
      ]);
    }
    setProductSearchTerm("");
    setSearchedProducts([]);
  };

  const getFullBreakdown = useCallback(() => {
    const subtotal = cartItems.reduce((total, item) => total + item.quantity * item.priceAtSale, 0);

    const iva = cartItems.reduce((total, item) => {
      const taxRate =
        (parseFloat(item.product?.iva) !== undefined && item.product?.iva !== ""
          ? parseFloat(item.product?.iva)
          : 13) / 100;
      return total + Math.round(item.quantity * item.priceAtSale * taxRate);
    }, 0);

    const prov = customerDetails.province || customerDetails.provincia;
    const cant = customerDetails.city || customerDetails.canton;

    const shippingBase = calculateShippingFee(prov, cant, cartItems);
    const shippingTax = Math.round(shippingBase * 0.13);

    return {
      subtotal,
      iva,
      shippingBase,
      shippingTax,
      total: subtotal + iva + shippingBase + shippingTax,
    };
  }, [cartItems, customerDetails]);

  const calculateTotalWeightGrams = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const weight = item.product?.weight || 100;
      return total + item.quantity * weight;
    }, 0);
  }, [cartItems]);

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.product._id !== productId));
  };

  const handleUpdateCartItemQuantity = (productId, newQuantity) => {
    const itemToUpdate = cartItems.find((item) => item.product._id === productId);
    if (!itemToUpdate) return;
    const maxStock = itemToUpdate.product.totalStock;
    const parsedQuantity = parseInt(newQuantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      setCartItems((items) =>
        items.map((item) => (item.product._id === productId ? { ...item, quantity: 1 } : item))
      );
      return;
    }
    if (parsedQuantity > maxStock) {
      toast.warn(`Stock máximo disponible: ${maxStock} unidades.`);
      setCartItems((items) =>
        items.map((item) =>
          item.product._id === productId ? { ...item, quantity: maxStock } : item
        )
      );
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.product._id === productId ? { ...item, quantity: parsedQuantity } : item
      )
    );
  };

  const handleQuantityButtonClick = (productId, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product._id === productId) {
          const maxStock = item.product.totalStock;
          const newQuantity = item.quantity + amount;
          if (newQuantity < 1) return item;
          if (newQuantity > maxStock) {
            toast.warn(`Stock máximo alcanzado: ${maxStock}`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleSaveOrder = async () => {
    const hasStatusChanged = currentStatus !== initialStatus;
    const normalizeItems = (items) =>
      JSON.stringify(
        items
          .map((i) => ({ p: i.product._id, q: i.quantity }))
          .sort((a, b) => a.p.localeCompare(b.p))
      );
    const hasAddressChanged =
      customerDetails.name !== (order.customerDetails?.name || "") ||
      customerDetails.phoneNumber !== (order.customerDetails?.phoneNumber || "") ||
      customerDetails.address !== (order.customerDetails?.address || "") ||
      customerDetails.provincia !==
        (order.customerDetails?.provincia || order.customerDetails?.province || "") ||
      customerDetails.canton !==
        (order.customerDetails?.canton || order.customerDetails?.city || "") ||
      customerDetails.distrito !== (order.customerDetails?.distrito || "");

    if (!hasStatusChanged && !hasItemsChanged && !hasAddressChanged)
      return toast.info("No hay cambios para guardar.");
    if (hasItemsChanged && !canModifyOrderItemsStatuses.includes(initialStatus))
      return toast.error("No se pueden modificar los artículos en este estado.");
    const updatedData = {
      status: currentStatus,
      items: cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        priceAtSale: item.priceAtSale,
        name: item.name,
        code: item.code,
      })),
      customerDetails: {
        ...order.customerDetails,
        ...customerDetails,
      },
    };
    try {
      await updateOrder(id, updatedData);
      toast.success("Pedido actualizado exitosamente!");
      navigate(`/orders/details/${id}`);
    } catch (err) {
      toast.error(err.message || "Error al actualizar el pedido.");
    }
  };

  if (!initialLoadComplete || orderLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando datos del pedido...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (fetchError || !order) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
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
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const hasStatusChanged = currentStatus !== initialStatus;
  const normalizeItems = (items) =>
    JSON.stringify(
      items.map((i) => ({ p: i.product._id, q: i.quantity })).sort((a, b) => a.p.localeCompare(b.p))
    );
  const hasItemsChanged = normalizeItems(cartItems) !== normalizeItems(initialCartItems);
  const hasAddressChanged =
    customerDetails.name !== (order.customerDetails?.name || "") ||
    customerDetails.phoneNumber !== (order.customerDetails?.phoneNumber || "") ||
    customerDetails.address !== (order.customerDetails?.address || "") ||
    customerDetails.provincia !==
      (order.customerDetails?.provincia || order.customerDetails?.province || "") ||
    customerDetails.canton !==
      (order.customerDetails?.canton || order.customerDetails?.city || "") ||
    customerDetails.distrito !== (order.customerDetails?.distrito || "");

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={8}>
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
                  Editar Pedido: {order.orderNumber || order._id}
                </MDTypography>
                <MDButton
                  onClick={() => navigate(`/orders/details/${id}`)}
                  variant="gradient"
                  color="dark"
                >
                  Ver Detalles
                </MDButton>
              </MDBox>
              <MDBox p={3} component="form" role="form" onSubmit={handleSaveOrder}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mb={2}>
                      Estado del Pedido: {statusTranslations[currentStatus]}
                    </MDTypography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="status-label">Estado</InputLabel>
                      <Select
                        labelId="status-label"
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value)}
                        label="Estado"
                        disabled={!isStatusDropdownEditable}
                        sx={{
                          color: darkMode ? "#fff !important" : "inherit",
                          "& .MuiSelect-select": {
                            color: darkMode ? "#fff !important" : "inherit",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: darkMode
                              ? "rgba(255, 255, 255, 0.3) !important"
                              : "inherit",
                          },
                          "& .MuiSvgIcon-root": {
                            color: darkMode ? "#fff !important" : "inherit",
                          },
                        }}
                      >
                        {Object.keys(statusTranslations).map((statusKey) => (
                          <MenuItem
                            key={statusKey}
                            value={statusKey}
                            sx={{
                              color: darkMode ? "#fff !important" : "inherit",
                            }}
                          >
                            {statusTranslations[statusKey]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={2} mb={1}>
                      Información del Cliente:
                    </MDTypography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre del Cliente"
                      value={customerDetails.name}
                      onChange={(e) =>
                        setCustomerDetails({ ...customerDetails, name: e.target.value })
                      }
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={customerDetails.phoneNumber}
                      onChange={(e) =>
                        setCustomerDetails({ ...customerDetails, phoneNumber: e.target.value })
                      }
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Provincia"
                      value={customerDetails.provincia || customerDetails.province}
                      onChange={(e) =>
                        setCustomerDetails({
                          ...customerDetails,
                          provincia: e.target.value,
                          province: e.target.value,
                        })
                      }
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Cantón"
                      value={customerDetails.canton || customerDetails.city}
                      onChange={(e) =>
                        setCustomerDetails({
                          ...customerDetails,
                          canton: e.target.value,
                          city: e.target.value,
                        })
                      }
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Distrito"
                      value={customerDetails.distrito}
                      onChange={(e) =>
                        setCustomerDetails({ ...customerDetails, distrito: e.target.value })
                      }
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Dirección Exacta"
                      value={customerDetails.address}
                      onChange={(e) =>
                        setCustomerDetails({ ...customerDetails, address: e.target.value })
                      }
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={1}>
                      Modificar Artículos:
                    </MDTypography>
                  </Grid>
                  {areOrderItemsEditable ? (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Buscar producto por nombre o código para añadir"
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        placeholder="Ej: Eros, PERF001..."
                        disabled={!areOrderItemsEditable}
                      />
                      {productsLoading && <CircularProgress size={20} sx={{ mt: 1 }} />}
                      {!productsLoading && searchedProducts.length > 0 && (
                        <Card sx={{ mt: 1, maxHeight: 220, overflow: "auto" }}>
                          <List dense>
                            {searchedProducts.map((product) => (
                              <ListItem key={product._id} divider>
                                <MDBox flexGrow={1} p={2}>
                                  <MDTypography variant="button" color="text" fontWeight="medium">
                                    {product.name}
                                  </MDTypography>
                                  <MDTypography
                                    variant="caption"
                                    color="text"
                                    display="block"
                                  >{`Cód: ${product.code} | Stock: ${product.countInStock}`}</MDTypography>
                                </MDBox>
                                <ListItemSecondaryAction>
                                  <MDButton
                                    variant="outlined"
                                    color="info"
                                    size="small"
                                    onClick={() => handleAddToCart(product)}
                                    sx={{ mr: 1 }}
                                  >
                                    Añadir
                                  </MDButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        </Card>
                      )}
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <MDTypography variant="body2" color="text">
                        No se pueden modificar los artículos en el estado actual del pedido.
                      </MDTypography>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={2}>
                      Artículos Actuales ({cartItems.length}):
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    {cartItems.length > 0 ? (
                      cartItems.map((item) => {
                        const maxStock = item.product.totalStock;
                        return (
                          <MDBox
                            key={item.product._id}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            mb={1}
                            p={1}
                            borderBottom="1px solid #eee"
                          >
                            <MDBox display="flex" alignItems="center" flex={1} mr={2}>
                              <MDBox
                                component="img"
                                src={
                                  item.product?.imageUrls?.[0]?.secure_url ||
                                  "https://placehold.co/40x40/cccccc/000000?text=Item"
                                }
                                alt={item.name}
                                sx={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "md",
                                  mr: 1.5,
                                }}
                              />
                              <MDTypography variant="button" fontWeight="medium" color="text">
                                {item.name} (Cód: {item.code}) - {item.quantity} x{" "}
                                {item.priceAtSale.toLocaleString("es-CR", {
                                  style: "currency",
                                  currency: "CRC",
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })}
                              </MDTypography>
                            </MDBox>
                            <MDBox display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1 }}>
                              {isMobile ? (
                                <>
                                  <IconButton
                                    onClick={() => handleQuantityButtonClick(item.product._id, -1)}
                                    disabled={!areOrderItemsEditable || item.quantity <= 1}
                                    size="small"
                                  >
                                    <RemoveCircleOutlineIcon />
                                  </IconButton>
                                  <MDTypography
                                    variant="body2"
                                    sx={{ width: "2ch", textAlign: "center", fontWeight: "bold" }}
                                  >
                                    {item.quantity}
                                  </MDTypography>
                                  <IconButton
                                    onClick={() => handleQuantityButtonClick(item.product._id, 1)}
                                    disabled={!areOrderItemsEditable || item.quantity >= maxStock}
                                    size="small"
                                  >
                                    <AddCircleOutlineIcon />
                                  </IconButton>
                                </>
                              ) : (
                                // <TextField
                                //   type="number"
                                //   value={item.quantity}
                                //   onChange={(e) =>
                                //     handleUpdateCartItemQuantity(item.product._id, e.target.value)
                                //   }
                                //   inputProps={{ min: 1, max: maxStock }}
                                //   sx={{ width: "70px" }}
                                //   size="small"
                                //   disabled={!areOrderItemsEditable}
                                // />
                                <>
                                  <IconButton
                                    onClick={() => handleQuantityButtonClick(item.product._id, -1)}
                                    disabled={!areOrderItemsEditable || item.quantity <= 1}
                                    size="small"
                                  >
                                    <RemoveCircleOutlineIcon />
                                  </IconButton>
                                  <MDTypography
                                    variant="body2"
                                    sx={{ width: "2ch", textAlign: "center", fontWeight: "bold" }}
                                  >
                                    {item.quantity}
                                  </MDTypography>
                                  <IconButton
                                    onClick={() => handleQuantityButtonClick(item.product._id, 1)}
                                    disabled={!areOrderItemsEditable || item.quantity >= maxStock}
                                    size="small"
                                  >
                                    <AddCircleOutlineIcon />
                                  </IconButton>
                                </>
                              )}
                              <IconButton
                                onClick={() => handleRemoveFromCart(item.product._id)}
                                color="error"
                                disabled={!areOrderItemsEditable}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </MDBox>
                          </MDBox>
                        );
                      })
                    ) : (
                      <MDTypography variant="body2" color="text">
                        No hay productos en este pedido.
                      </MDTypography>
                    )}
                    <MDBox
                      mt={3}
                      p={2}
                      bgColor={darkMode ? "grey-900" : "grey-100"}
                      borderRadius="lg"
                    >
                      <MDTypography variant="h6" mb={1}>
                        Desglose Actualizado del Pedido:
                      </MDTypography>
                      <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                        <MDTypography variant="button" color="text">
                          Subtotal Productos:
                        </MDTypography>
                        <MDTypography variant="button" fontWeight="medium">
                          {getFullBreakdown().subtotal.toLocaleString("es-CR", {
                            style: "currency",
                            currency: "CRC",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                        <MDTypography variant="button" color="text">
                          IVA Productos:
                        </MDTypography>
                        <MDTypography variant="button" fontWeight="medium">
                          {getFullBreakdown().iva.toLocaleString("es-CR", {
                            style: "currency",
                            currency: "CRC",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                        <MDTypography variant="button" color="text">
                          Envío Estimado:
                        </MDTypography>
                        <MDTypography variant="button" fontWeight="medium">
                          {getFullBreakdown().shippingBase.toLocaleString("es-CR", {
                            style: "currency",
                            currency: "CRC",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                        <MDTypography variant="button" color="text">
                          IVA Envío (13%):
                        </MDTypography>
                        <MDTypography variant="button" fontWeight="medium">
                          {getFullBreakdown().shippingTax.toLocaleString("es-CR", {
                            style: "currency",
                            currency: "CRC",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </MDTypography>
                      </MDBox>
                      <MDBox
                        mt={1}
                        pt={1}
                        borderTop="1px solid #ccc"
                        display="flex"
                        justifyContent="space-between"
                      >
                        <MDTypography variant="h5">Total Final:</MDTypography>
                        <MDTypography variant="h5" color="info">
                          {Math.round(getFullBreakdown().total).toLocaleString("es-CR", {
                            style: "currency",
                            currency: "CRC",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </MDTypography>
                      </MDBox>
                      <MDTypography variant="caption" color="text" sx={{ mt: 1, display: "block" }}>
                        Peso: {calculateTotalWeightGrams()}g | Región:{" "}
                        {isGAM(
                          customerDetails.province || customerDetails.provincia,
                          customerDetails.city || customerDetails.canton
                        )
                          ? "GAM"
                          : "Rural/Resto"}
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  <Grid item xs={12} display="flex" justifyContent="flex-end" mt={3}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={handleSaveOrder}
                      disabled={
                        orderLoading ||
                        (!hasStatusChanged && !hasItemsChanged && !hasAddressChanged)
                      }
                    >
                      {orderLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Guardar Cambios"
                      )}
                    </MDButton>
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

export default EditOrder;
