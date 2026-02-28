import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import DOMPurify from "dompurify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import MDBadge from "components/MDBadge"; // Custom Badge if available

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useProducts } from "contexts/ProductContext";
import { useAuth } from "contexts/AuthContext";

// Icons
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import SellIcon from "@mui/icons-material/Sell";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StraightenIcon from "@mui/icons-material/Straighten";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BrandingWatermarkIcon from "@mui/icons-material/BrandingWatermark";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

const HTMLContent = ({ html, fallback = "No description available.", ...typographyProps }) => {
  const createMarkup = (htmlContent) => ({ __html: DOMPurify.sanitize(htmlContent || "") });

  if (!html || html.trim() === "") {
    return <MDTypography {...typographyProps}>{fallback}</MDTypography>;
  }

  return <MDTypography {...typographyProps} dangerouslySetInnerHTML={createMarkup(html)} />;
};

HTMLContent.propTypes = {
  html: PropTypes.string,
  fallback: PropTypes.string,
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, loading } = useProducts();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setInitialLoading(true);
        setFetchError(null);
        if (typeof getProductById !== "function") {
          throw new Error("La función para obtener el producto no está disponible.");
        }
        const fetchedProduct = await getProductById(id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setCurrentImageIndex(0);
        } else {
          setFetchError("Detalles del producto no encontrados.");
          toast.error("Detalles del producto no encontrados.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del producto.");
        toast.error(err.message || "Error al cargar los detalles del producto.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, getProductById]);

  const handleNextImage = () => {
    if (product && product.imageUrls && product.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.imageUrls.length);
    }
  };

  const handlePrevImage = () => {
    if (product && product.imageUrls && product.imageUrls.length > 0) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex - 1 + product.imageUrls.length) % product.imageUrls.length
      );
    }
  };

  const displayValue = (value, isArray = false) => {
    if (isArray) {
      return value && value.length > 0 ? value : "N/A";
    }
    return value || "N/A";
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          pt={6}
          pb={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando detalles del producto...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (fetchError || !product) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          pt={6}
          pb={3}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <MDTypography variant="h5" color="error" mb={2}>
            Error: {fetchError || "Producto no encontrado."}
          </MDTypography>
          <MDButton onClick={() => navigate("/products")} variant="gradient" color="info">
            Volver a Productos
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const userResellerCategory =
    user?.role === "Administrador" || user?.role === "Editor" ? "cat1" : user?.resellerCategory;
  const displayPrice =
    product.resellerPrices?.[userResellerCategory] || product.resellerPrices?.cat1;
  const formattedPrice =
    displayPrice?.toLocaleString("es-CR", { style: "currency", currency: "CRC" }) || "N/A";

  // Modern UI Components Helpers
  const InfoRow = ({ icon: IconComponent, label, value }) => (
    <MDBox display="flex" alignItems="flex-start" mb={1.5}>
      <MDBox color="text" mr={1.5} mt={0.2} display="flex" alignItems="center">
        {IconComponent && <IconComponent fontSize="small" color="inherit" />}
      </MDBox>
      <MDBox>
        <MDTypography variant="caption" color="text" fontWeight="medium" textTransform="uppercase">
          {label}
        </MDTypography>
        <MDTypography variant="body2" color="dark" fontWeight="bold">
          {value}
        </MDTypography>
      </MDBox>
    </MDBox>
  );

  InfoRow.propTypes = {
    icon: PropTypes.elementType,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* Main Header Card */}
        <Card sx={{ mb: 3, overflow: "visible" }}>
          <MDBox
            mx={2}
            mt={-3}
            py={3}
            px={3}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <MDBox>
              <MDTypography variant="h5" color="white" fontWeight="bold">
                {product.name}
              </MDTypography>
              <MDTypography variant="button" color="white" opacity={0.8}>
                {product.code}
              </MDTypography>
            </MDBox>
            <MDBox display="flex" alignItems="center">
              <MDButton
                onClick={() => navigate("/products")}
                variant="outlined"
                color="white"
                sx={{ mr: 1 }}
              >
                Volver
              </MDButton>
              <MDButton
                onClick={() => navigate(`/products/edit/${product._id}`)}
                variant="contained"
                color="white"
              >
                Editar
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>

        {/* Content Layout */}
        <Grid container spacing={3}>
          {/* LEFT COLUMN - Images & Description */}
          <Grid item xs={12} lg={4}>
            {/* Image Gallery */}
            <Card
              sx={{
                mb: 3,
                p: 2,
                height: "100%",
                maxHeight: "500px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <MDBox
                position="relative"
                flex={1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "lg",
                  overflow: "hidden",
                  bgcolor: "grey.100",
                }}
              >
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <>
                    <MDBox
                      component="img"
                      src={product.imageUrls[currentImageIndex]?.secure_url}
                      alt={product.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                    {product.imageUrls.length > 1 && (
                      <>
                        <MDButton
                          variant="contained"
                          color="white"
                          onClick={handlePrevImage}
                          sx={{
                            position: "absolute",
                            left: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            minWidth: 40,
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            zIndex: 1,
                            p: 0,
                          }}
                        >
                          <Icon color="dark">arrow_back_ios_new</Icon>
                        </MDButton>
                        <MDButton
                          variant="contained"
                          color="white"
                          onClick={handleNextImage}
                          sx={{
                            position: "absolute",
                            right: 10,
                            top: "50%",
                            transform: "translateY(-50%)",
                            minWidth: 40,
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            zIndex: 1,
                            p: 0,
                          }}
                        >
                          <Icon color="dark">arrow_forward_ios</Icon>
                        </MDButton>
                        <MDBox
                          display="flex"
                          justifyContent="center"
                          position="absolute"
                          bottom={10}
                          left="50%"
                          sx={{ transform: "translateX(-50%)", zIndex: 1 }}
                        >
                          {product.imageUrls.map((_, index) => (
                            <MDBox
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                mx: 0.5,
                                cursor: "pointer",
                                bgcolor: index === currentImageIndex ? "info.main" : "white",
                                boxShadow: 1,
                                transition: "all 0.3s ease",
                              }}
                            />
                          ))}
                        </MDBox>
                      </>
                    )}
                  </>
                ) : (
                  <MDTypography variant="body2" color="text">
                    Sin imagen
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* RIGHT COLUMN - Details Matrix */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {/* General Info Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%", p: 3 }}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <AssignmentIcon color="info" sx={{ mr: 1 }} />
                    <MDTypography variant="h6" fontWeight="medium">
                      Información General
                    </MDTypography>
                  </MDBox>
                  <Divider sx={{ mt: 0, mb: 2 }} />

                  <InfoRow
                    icon={BrandingWatermarkIcon}
                    label="Marca"
                    value={displayValue(product.brand)}
                  />
                  <InfoRow
                    icon={CategoryIcon}
                    label="Categoría"
                    value={displayValue(product.category)}
                  />
                  <InfoRow
                    icon={FormatListBulletedIcon}
                    label="Subcategoría"
                    value={displayValue(product.subcategory)}
                  />
                  <InfoRow
                    icon={AssignmentIcon}
                    label="Departamento"
                    value={displayValue(product.department)}
                  />
                  <InfoRow
                    icon={AssignmentIcon}
                    label="Código CABYS"
                    value={displayValue(product.codigoCabys)}
                  />

                  <MDBox display="flex" alignItems="center" mt={2}>
                    <MDTypography
                      variant="caption"
                      color="text"
                      fontWeight="medium"
                      textTransform="uppercase"
                      mr={1}
                    >
                      Estado:
                    </MDTypography>
                    {product.active ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Activo"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<CancelIcon />}
                        label="Inactivo"
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </MDBox>
                </Card>
              </Grid>

              {/* Status & Inventory & Dimensions Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%", p: 3 }}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <InventoryIcon color="info" sx={{ mr: 1 }} />
                    <MDTypography variant="h6" fontWeight="medium">
                      Inventario & Medidas
                    </MDTypography>
                  </MDBox>
                  <Divider sx={{ mt: 0, mb: 2 }} />

                  <MDBox mb={2}>
                    <MDTypography
                      variant="caption"
                      color="text"
                      fontWeight="medium"
                      textTransform="uppercase"
                    >
                      Stock Disponible
                    </MDTypography>
                    <MDBox display="flex" alignItems="baseline">
                      <MDTypography
                        variant="h4"
                        color={product.countInStock > 10 ? "success" : "error"}
                        fontWeight="bold"
                      >
                        {product.countInStock || 0}
                      </MDTypography>
                      <MDTypography variant="button" color="text" ml={0.5}>
                        unidades
                      </MDTypography>
                    </MDBox>
                  </MDBox>

                  <InfoRow
                    icon={StraightenIcon}
                    label="Peso"
                    value={product.weight ? `${product.weight} g` : "N/A"}
                  />
                  <InfoRow
                    icon={StraightenIcon}
                    label="Dimensiones (Ancho x Alto x Prof.)"
                    value={
                      product.dimensions &&
                      (product.dimensions.width ||
                        product.dimensions.height ||
                        product.dimensions.depth)
                        ? `${product.dimensions.width || 0} x ${product.dimensions.height || 0} x ${
                            product.dimensions.depth || 0
                          } cm`
                        : "N/A"
                    }
                  />
                  <InfoRow
                    icon={AssignmentIcon}
                    label="Garantía"
                    value={displayValue(product.warranty)}
                  />
                  <InfoRow
                    icon={AssignmentIcon}
                    label="Rango Etario"
                    value={displayValue(product.ageRange)}
                  />
                  <InfoRow
                    icon={AssignmentIcon}
                    label="Ubicación"
                    value={displayValue(product.recommendedLocation)}
                  />
                </Card>
              </Grid>

              {/* Pricing Card */}
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <SellIcon color="success" sx={{ mr: 1 }} />
                    <MDTypography variant="h6" fontWeight="medium">
                      Precios por Categorias de Clientes
                    </MDTypography>
                  </MDBox>
                  <Divider sx={{ mt: 0, mb: 2 }} />

                  <Grid container spacing={2}>
                    {["cat1", "cat2", "cat3", "cat4", "cat5"].map((cat) => (
                      <Grid item xs={6} sm={4} md={2.4} key={cat}>
                        <MDBox
                          p={2}
                          borderRadius="lg"
                          variant="gradient"
                          bgColor="info"
                          textAlign="center"
                          sx={{
                            transition: "all 0.2s",
                            // Subtle highlighting for the user's own category
                            border:
                              userResellerCategory === cat
                                ? "2px solid rgba(255,255,255,0.8)"
                                : "none",
                            boxShadow: userResellerCategory === cat ? 3 : 1,
                          }}
                        >
                          <MDTypography variant="caption" color="white" fontWeight="bold">
                            {"Nivel " + cat.replace("cat", "")}{" "}
                            {userResellerCategory === cat && "(Tu Nivel)"}
                          </MDTypography>
                          <MDTypography variant="h6" color="white" fontWeight="bold">
                            {product.resellerPrices?.[cat]?.toLocaleString("es-CR", {
                              style: "currency",
                              currency: "CRC",
                              maximumFractionDigits: 0,
                            }) || "N/A"}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    ))}
                  </Grid>
                </Card>
              </Grid>

              {/* Attributes Card */}
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <LocalOfferIcon color="warning" sx={{ mr: 1 }} />
                    <MDTypography variant="h6" fontWeight="medium">
                      Atributos Flexibles & Etiquetas
                    </MDTypography>
                  </MDBox>
                  <Divider sx={{ mt: 0, mb: 2 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        textTransform="uppercase"
                        mb={1}
                        display="block"
                      >
                        Colores Disponibles
                      </MDTypography>
                      <MDBox display="flex" flexWrap="wrap" gap={1}>
                        {product.colors && product.colors.length > 0 ? (
                          product.colors.map((c, i) => (
                            <Chip
                              key={i}
                              label={c}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          ))
                        ) : (
                          <MDTypography variant="body2" color="text">
                            N/A
                          </MDTypography>
                        )}
                      </MDBox>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        textTransform="uppercase"
                        mb={1}
                        display="block"
                      >
                        Tallas / Tamaños
                      </MDTypography>
                      <MDBox display="flex" flexWrap="wrap" gap={1}>
                        {product.sizes && product.sizes.length > 0 ? (
                          product.sizes.map((s, i) => (
                            <Chip
                              key={i}
                              label={s}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          ))
                        ) : (
                          <MDTypography variant="body2" color="text">
                            N/A
                          </MDTypography>
                        )}
                      </MDBox>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        textTransform="uppercase"
                        mb={1}
                        display="block"
                      >
                        Materiales
                      </MDTypography>
                      <MDBox display="flex" flexWrap="wrap" gap={1}>
                        {product.materials && product.materials.length > 0 ? (
                          product.materials.map((m, i) => (
                            <Chip
                              key={i}
                              label={m}
                              size="small"
                              variant="filled"
                              color="success"
                              sx={{ color: "#fff" }}
                            />
                          ))
                        ) : (
                          <MDTypography variant="body2" color="text">
                            N/A
                          </MDTypography>
                        )}
                      </MDBox>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        textTransform="uppercase"
                        mb={1}
                        display="block"
                      >
                        Volumen / Género
                      </MDTypography>
                      <MDTypography variant="body2" color="dark">
                        <b>Vol:</b> {displayValue(product.volume)} &nbsp;|&nbsp; <b>Gén:</b>{" "}
                        {displayValue(product.gender)}
                      </MDTypography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        textTransform="uppercase"
                        mb={1}
                        display="block"
                      >
                        Electricidad & Baterías
                      </MDTypography>
                      <MDTypography variant="body2" color="dark">
                        <b>Voltaje:</b> {displayValue(product.voltage)} &nbsp;|&nbsp;{" "}
                        <b>Batería:</b> {displayValue(product.batteryType)}{" "}
                        {product.includesBatteries ? "(Incluida)" : ""}
                      </MDTypography>
                    </Grid>

                    <Grid item xs={12}>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        textTransform="uppercase"
                        mb={1}
                        display="block"
                      >
                        Características Adicionales
                      </MDTypography>
                      <MDBox display="flex" flexWrap="wrap" gap={1}>
                        {product.features && product.features.length > 0 ? (
                          product.features.map((f, i) => (
                            <Chip key={i} label={f} size="small" variant="outlined" color="info" />
                          ))
                        ) : (
                          <MDTypography variant="body2" color="text">
                            N/A
                          </MDTypography>
                        )}
                      </MDBox>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Tags & Promotional Labels */}
                  <MDBox display="flex" flexDirection="column" gap={2}>
                    <MDBox>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        textTransform="uppercase"
                        mb={1}
                        display="block"
                      >
                        Etiquetas Promocionales
                      </MDTypography>
                      <MDBox display="flex" flexWrap="wrap" gap={1}>
                        {product.promotionalLabels && product.promotionalLabels.length > 0 ? (
                          product.promotionalLabels.map((l, i) => (
                            <Chip
                              key={i}
                              label={l.name || l}
                              size="small"
                              sx={{
                                background: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
                                color: "white",
                                border: "none",
                                fontWeight: "bold",
                              }}
                            />
                          ))
                        ) : (
                          <MDTypography variant="body2" color="text">
                            N/A
                          </MDTypography>
                        )}
                      </MDBox>
                    </MDBox>

                    <MDBox>
                      <MDTypography
                        variant="caption"
                        color="text"
                        fontWeight="medium"
                        textTransform="uppercase"
                        mb={1}
                        display="block"
                      >
                        Etiquetas Búsqueda (Tags)
                      </MDTypography>
                      <MDBox display="flex" flexWrap="wrap" gap={1}>
                        {product.tags && product.tags.length > 0 ? (
                          product.tags.map((t, i) => (
                            <Chip
                              key={i}
                              label={t}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: "grey.700", color: "grey.800" }}
                            />
                          ))
                        ) : (
                          <MDTypography variant="body2" color="text">
                            N/A
                          </MDTypography>
                        )}
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* BOTTOM ROW - Descriptions */}
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Descripción Detallada
              </MDTypography>
              <Divider sx={{ mt: 0, mb: 2 }} />
              <HTMLContent
                html={product.description}
                fallback="No hay descripción disponible para este producto."
                variant="body2"
                color="text"
                sx={{
                  lineHeight: 1.8,
                  "& p": { mb: 2 },
                  "& ul, & ol": { ml: 3, mb: 2 },
                  "& li": { mb: 0.5 },
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ProductDetail;
