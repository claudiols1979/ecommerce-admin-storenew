import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import { useTheme, useMediaQuery, Chip, CircularProgress, Icon } from "@mui/material";

// @mui icons
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Contexts
import { useProducts } from "contexts/ProductContext";
import { useAuth } from "contexts/AuthContext";
import { useLabels } from "contexts/LabelContext"; // <-- 1. IMPORTAR EL CONTEXTO DE ETIQUETAS
import { useVariants } from "contexts/VariantContext";
import { useMaterialUIController } from "context";
import { Divider } from "@mui/material";

function CreateProduct() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();
  const { createProduct, getNextBaseCode, loading: productLoading } = useProducts();
  const { user } = useAuth();

  // --- 2. USAR EL CONTEXTO DE ETIQUETAS ---
  const { labels, fetchLabels, assignLabelsToProduct, loading: labelsLoading } = useLabels();
  const { attributes, fetchAttributes } = useVariants();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [productData, setProductData] = useState({
    name: "",
    code: "",
    description: "",
    department: "",
    brand: "",
    category: "",
    subcategory: "",
    iva: "13",
    codigoCabys: "",
    volume: "",
    gender: "Unisex",
    tags: "",
    countInStock: 0,
    active: true,
    resellerPrices: { cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0 },
    // Nuevos campos flexibles
    colors: [],
    sizes: [],
    materials: [],
    ageRange: "",
    features: [],
    voltage: "",
    warranty: "",
    includesBatteries: false,
    batteryType: "",
    dimensions: { width: 0, height: 0, depth: 0 },
    weight: 0,
    recommendedLocation: "",
  });

  const [materialInput, setMaterialInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Rich Text Editor Modules
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  // --- 3. NUEVO ESTADO PARA LAS ETIQUETAS SELECCIONADAS ---
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);

  const genderOptions = [
    { value: "Hombre", label: "Hombre" },
    { value: "Mujer", label: "Mujer" },
    { value: "Unisex", label: "Unisex" },
    { value: "Niño", label: "Niño" },
    { value: "Niña", label: "Niña" },
  ];

  const ageRangeOptions = [
    { value: "Bebé", label: "Bebé" },
    { value: "Infantil", label: "Infantil" },
    { value: "Adolescente", label: "Adolescente" },
    { value: "Adulto", label: "Adulto" },
  ];

  const voltageOptions = [
    { value: "110V", label: "110V" },
    { value: "220V", label: "220V" },
    { value: "Bivoltaje", label: "Bivoltaje" },
  ];

  const warrantyOptions = [
    { value: "3 meses", label: "3 meses" },
    { value: "6 meses", label: "6 meses" },
    { value: "1 año", label: "1 año" },
    { value: "2 años", label: "2 años" },
  ];

  const batteryTypeOptions = [
    { value: "AA", label: "AA" },
    { value: "AAA", label: "AAA" },
    { value: "Recargable", label: "Recargable" },
    { value: "Litio", label: "Litio" },
  ];

  const locationOptions = [
    { value: "Interior", label: "Interior" },
    { value: "Exterior", label: "Exterior" },
  ];

  // --- 4. OBTENER LAS ETIQUETAS Y CÓDIGO AL CARGAR EL COMPONENTE ---
  useEffect(() => {
    fetchLabels();
    fetchAttributes();

    // Auto-generar el consecutivo del código base
    const fetchNextCode = async () => {
      try {
        const nextCode = await getNextBaseCode();
        if (nextCode) {
          setProductData((prev) => ({ ...prev, code: nextCode }));
        }
      } catch (error) {
        console.error("Error fetching next base code:", error);
      }
    };
    fetchNextCode();
  }, [fetchLabels, fetchAttributes, getNextBaseCode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("dimensions.")) {
      const dimension = name.split(".")[1];
      setProductData((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [dimension]: parseFloat(value) || 0 },
      }));
    } else if (name.startsWith("resellerPrices.")) {
      const cat = name.split(".")[1];
      setProductData((prev) => ({
        ...prev,
        resellerPrices: { ...prev.resellerPrices, [cat]: parseFloat(value) || 0 },
      }));
    } else if (name === "countInStock" || name === "weight") {
      setProductData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (type === "checkbox") {
      setProductData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setProductData((prev) => ({ ...prev, [name]: value }));
    }
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAddItem = (field, inputValue, setInputValue) => {
    if (inputValue.trim() && !productData[field].includes(inputValue.trim())) {
      setProductData((prev) => ({
        ...prev,
        [field]: [...prev[field], inputValue.trim()],
      }));
      setInputValue("");
    }
  };

  const handleRemoveItem = (field, item) => {
    setProductData((prev) => ({
      ...prev,
      [field]: prev[field].filter((i) => i !== item),
    }));
  };

  const handleDescriptionChange = (content) => {
    setProductData((prev) => ({ ...prev, description: content }));
    setFormErrors((prev) => ({ ...prev, description: undefined }));
  };

  const handleStockChange = (amount) => {
    setProductData((prev) => ({
      ...prev,
      countInStock: Math.max(0, prev.countInStock + amount),
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Solo se permiten hasta 5 imágenes por producto.");
      return;
    }
    setSelectedFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  // --- 5. NUEVO HANDLER PARA EL TOGGLE DE ETIQUETAS ---
  const handleLabelToggle = (labelId) => {
    setSelectedLabelIds((prevSelected) =>
      prevSelected.includes(labelId)
        ? prevSelected.filter((id) => id !== labelId)
        : [...prevSelected, labelId]
    );
  };

  const validateForm = () => {
    const errors = {};
    if (!productData.name) errors.name = "El nombre es requerido.";
    if (!productData.code) errors.code = "El código es requerido.";
    if (!productData.description) errors.description = "La descripción es requerida.";
    if (!productData.brand) errors.brand = "La marca es requerida.";
    if (!productData.category) errors.category = "La categoría es requerida.";
    if (!productData.volume) errors.volume = "El volumen es requerido.";
    if (!productData.gender) errors.gender = "El género es requerido.";
    if (
      typeof productData.countInStock !== "number" ||
      productData.countInStock < 0 ||
      isNaN(productData.countInStock)
    ) {
      errors.countInStock = "El stock debe ser un número positivo o cero.";
    }
    const requiredCategories = ["cat1", "cat2", "cat3", "cat4", "cat5"];
    requiredCategories.forEach((cat) => {
      const price = productData.resellerPrices[cat];
      if (typeof price !== "number" || price < 0 || isNaN(price)) {
        errors[
          `resellerPrices.${cat}`
        ] = `El precio para ${cat.toUpperCase()} debe ser un número positivo.`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores en el formulario.");
      return;
    }
    if (!user || !["Administrador", "Editor"].includes(user.role)) {
      toast.error("No tienes permiso para crear productos.");
      return;
    }

    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === "resellerPrices") {
        Object.keys(productData.resellerPrices).forEach((cat) => {
          formData.append(`resellerPrices[${cat}]`, productData.resellerPrices[cat]);
        });
      } else if (key === "dimensions") {
        Object.keys(productData.dimensions).forEach((dim) =>
          formData.append(`dimensions[${dim}]`, productData.dimensions[dim])
        );
      } else if (Array.isArray(productData[key])) {
        // Enviar arrays siempre como JSON string
        formData.append(key, JSON.stringify(productData[key]));
      } else if (key === "tags") {
        productData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
          .forEach((tag) => {
            formData.append("tags", tag);
          });
      } else {
        formData.append(key, productData[key]);
      }
    });
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const createdProductResponse = await createProduct(formData);
      const newProductId = createdProductResponse?.product?._id;

      if (!newProductId) {
        throw new Error("No se pudo obtener el ID del producto recién creado.");
      }

      if (selectedLabelIds.length > 0) {
        await assignLabelsToProduct(newProductId, selectedLabelIds);
      }

      toast.success("Producto creado y etiquetas asignadas exitosamente!");
      navigate("/products");
    } catch (err) {
      toast.error(err?.message || "Error al crear el producto o asignar etiquetas.");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
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
              >
                <MDTypography variant="h6" color="white">
                  Crear Nuevo Producto
                </MDTypography>
              </MDBox>
              <MDBox p={3} component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* --- OTROS CAMPOS DEL FORMULARIO (SIN CAMBIOS) --- */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Nombre del Producto"
                      name="name"
                      value={productData.name}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Código"
                      name="code"
                      value={productData.code}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.code}
                      helperText={formErrors.code}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      Descripción *
                    </MDTypography>
                    <MDBox
                      mt={1}
                      sx={{
                        "& .quill": {
                          backgroundColor: darkMode ? "#344767" : "#fff",
                          color: darkMode ? "#fff" : "inherit",
                          borderRadius: "8px",
                        },
                        "& .ql-toolbar": {
                          borderColor: darkMode
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(0, 0, 0, 0.23)",
                          borderTopLeftRadius: "8px",
                          borderTopRightRadius: "8px",
                        },
                        "& .ql-container": {
                          borderColor: darkMode
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(0, 0, 0, 0.23)",
                          borderBottomLeftRadius: "8px",
                          borderBottomRightRadius: "8px",
                          minHeight: "150px",
                        },
                        "& .ql-stroke": {
                          stroke: darkMode ? "#fff" : "#444",
                        },
                        "& .ql-fill": {
                          fill: darkMode ? "#fff" : "#444",
                        },
                        "& .ql-picker": {
                          color: darkMode ? "#fff !important" : "#444 !important",
                        },
                        "& .ql-picker-options": {
                          backgroundColor: darkMode ? "#344767 !important" : "#fff !important",
                          borderColor: darkMode
                            ? "rgba(255, 255, 255, 0.2) !important"
                            : "rgba(0, 0, 0, 0.23) !important",
                        },
                        "& .ql-picker-item": {
                          color: darkMode ? "#fff !important" : "#444 !important",
                        },
                        "& .ql-picker-item:hover": {
                          color: darkMode ? "#1A73E8 !important" : "#000 !important",
                        },
                      }}
                    >
                      <ReactQuill
                        theme="snow"
                        value={productData.description}
                        onChange={handleDescriptionChange}
                        modules={quillModules}
                      />
                    </MDBox>
                    {formErrors.description && (
                      <MDTypography variant="caption" color="error">
                        {formErrors.description}
                      </MDTypography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Marca"
                      name="brand"
                      value={productData.brand}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.brand}
                      helperText={formErrors.brand}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Departamento"
                      name="department"
                      value={productData.department}
                      onChange={handleChange}
                      fullWidth
                      placeholder="ej: Fragancias, Accesorios"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Categoría"
                      name="category"
                      value={productData.category}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.category}
                      helperText={formErrors.category}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Subcategoría"
                      name="subcategory"
                      value={productData.subcategory}
                      onChange={handleChange}
                      fullWidth
                      placeholder="ej: Eau de Parfum, Eau de Toilette"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Volumen"
                      name="volume"
                      value={productData.volume}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.volume}
                      helperText={formErrors.volume}
                      placeholder="ej: 100ml, 50ml, 1oz"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MDInput
                      label="IVA %"
                      name="iva"
                      type="number"
                      value={productData.iva}
                      onChange={handleChange}
                      fullWidth
                      placeholder="13"
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MDInput
                      label="Código CABYS"
                      name="codigoCabys"
                      value={productData.codigoCabys}
                      onChange={handleChange}
                      fullWidth
                      placeholder="Código Hacienda"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Género"
                      name="gender"
                      value={productData.gender}
                      onChange={handleChange}
                      select
                      fullWidth
                      required
                      error={!!formErrors.gender}
                      helperText={formErrors.gender}
                    >
                      {genderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  <Grid item xs={12} sm={6} mb={2}>
                    <MDInput
                      label="Notas aromáticas (separadas por coma)"
                      name="tags"
                      value={productData.tags}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} mt={-4}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      Cantidad en Inventario
                    </MDTypography>
                    {isMobile ? (
                      <MDBox
                        display="flex"
                        alignItems="center"
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "0.375rem",
                          p: "2px",
                          mt: 1,
                        }}
                      >
                        <IconButton
                          onClick={() => handleStockChange(-1)}
                          disabled={productData.countInStock <= 0}
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                        <MDBox
                          sx={{
                            flexGrow: 1,
                            textAlign: "center",
                            bgcolor: "action.hover",
                            borderRadius: 1,
                            py: 1,
                          }}
                        >
                          <MDTypography variant="body2" fontWeight="bold" color="text">
                            {productData.countInStock}
                          </MDTypography>
                        </MDBox>
                        <IconButton onClick={() => handleStockChange(1)}>
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </MDBox>
                    ) : (
                      <MDInput
                        name="countInStock"
                        type="number"
                        value={productData.countInStock}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!formErrors.countInStock}
                        helperText={formErrors.countInStock}
                        inputProps={{ min: 0, step: "1" }}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <MDBox display="flex" alignItems="center">
                      <MDTypography variant="body2" mr={1}>
                        Activo:
                      </MDTypography>
                      <Switch checked={productData.active} onChange={handleChange} name="active" />
                    </MDBox>
                  </Grid>

                  {/* --- NUEVOS ATRIBUTOS FLEXIBLES --- */}
                  <Grid item xs={12}>
                    <Divider>
                      <MDTypography variant="h5" color="primary">
                        Atributos Flexibles
                      </MDTypography>
                    </Divider>
                  </Grid>

                  {attributes &&
                    attributes.map((attr) => {
                      const refLower = attr.ref ? attr.ref.toLowerCase() : "";
                      let targetRef = refLower;

                      if (refLower.includes("color") || refLower.includes("colores")) {
                        targetRef = "colors";
                      } else if (refLower.includes("size") || refLower.includes("talla")) {
                        targetRef = "sizes";
                      } else if (refLower.includes("material")) {
                        targetRef = "materials";
                      } else {
                        targetRef = "features";
                      }

                      return (
                        <Grid item xs={12} sm={6} key={attr._id}>
                          <MDInput
                            select
                            SelectProps={{
                              displayEmpty: true,
                              MenuProps: { PaperProps: { style: { maxHeight: 250 } } },
                            }}
                            label={`Seleccionar ${attr.name}`}
                            value={
                              productData[targetRef] && productData[targetRef].length > 0
                                ? productData[targetRef][0]
                                : ""
                            }
                            onChange={(e) => {
                              const { value } = e.target;
                              if (value) {
                                setProductData((prev) => ({
                                  ...prev,
                                  [targetRef]: prev[targetRef].includes(value)
                                    ? prev[targetRef]
                                    : [...prev[targetRef], value],
                                }));
                              }
                            }}
                            fullWidth
                          >
                            <MenuItem value="">
                              <em>Seleccione una opción...</em>
                            </MenuItem>
                            {Array.isArray(attr.values) &&
                              attr.values.map((v) => (
                                <MenuItem key={v._id || v.value} value={v.value}>
                                  {v.value}
                                </MenuItem>
                              ))}
                          </MDInput>
                        </Grid>
                      );
                    })}

                  {/* Entrada manual de materiales */}
                  <Grid item xs={12} sm={6}>
                    <MDBox display="flex" alignItems="flex-start">
                      <MDInput
                        label="Agregar Material (manual)"
                        value={materialInput}
                        onChange={(e) => setMaterialInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddItem("materials", materialInput, setMaterialInput);
                          }
                        }}
                        fullWidth
                      />
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        sx={{ ml: 1, minHeight: "44px" }}
                        onClick={() => handleAddItem("materials", materialInput, setMaterialInput)}
                      >
                        <Icon>add</Icon>
                      </MDButton>
                    </MDBox>
                    <MDBox display="flex" flexWrap="wrap" gap={1} mt={1}>
                      {productData.materials.map((m) => (
                        <Chip
                          key={m}
                          label={m}
                          onDelete={() => handleRemoveItem("materials", m)}
                          color="info"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </MDBox>
                  </Grid>

                  {/* Entrada manual de características */}
                  <Grid item xs={12} sm={6}>
                    <MDBox display="flex" alignItems="flex-start">
                      <MDInput
                        label="Agregar Característica (manual)"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddItem("features", featureInput, setFeatureInput);
                          }
                        }}
                        fullWidth
                      />
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        sx={{ ml: 1, minHeight: "44px" }}
                        onClick={() => handleAddItem("features", featureInput, setFeatureInput)}
                      >
                        <Icon>add</Icon>
                      </MDButton>
                    </MDBox>
                    <MDBox display="flex" flexWrap="wrap" gap={1} mt={1}>
                      {productData.features.map((f) => (
                        <Chip
                          key={f}
                          label={f}
                          onDelete={() => handleRemoveItem("features", f)}
                          color="info"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </MDBox>
                  </Grid>

                  {/* Rango etario */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Rango Etario"
                      name="ageRange"
                      value={productData.ageRange}
                      onChange={handleChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Seleccionar rango etario</MenuItem>
                      {ageRangeOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  {/* Voltaje */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Voltaje"
                      name="voltage"
                      value={productData.voltage}
                      onChange={handleChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Seleccionar voltaje</MenuItem>
                      {voltageOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  {/* Garantía */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Garantía"
                      name="warranty"
                      value={productData.warranty}
                      onChange={handleChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Seleccionar garantía</MenuItem>
                      {warrantyOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  {/* Tipo de batería */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Tipo de Batería"
                      name="batteryType"
                      value={productData.batteryType}
                      onChange={handleChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Seleccionar tipo de batería</MenuItem>
                      {batteryTypeOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  {/* Incluye baterías */}
                  <Grid item xs={12} sm={6}>
                    <MDBox display="flex" alignItems="center" mt={1}>
                      <MDTypography variant="body2" mr={1}>
                        Incluye baterías:
                      </MDTypography>
                      <Switch
                        checked={productData.includesBatteries}
                        onChange={handleChange}
                        name="includesBatteries"
                      />
                    </MDBox>
                  </Grid>

                  {/* Ubicación recomendada */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Ubicación Recomendada"
                      name="recommendedLocation"
                      value={productData.recommendedLocation}
                      onChange={handleChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Seleccionar ubicación</MenuItem>
                      {locationOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  {/* Dimensiones */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mb={1}>
                      Dimensiones (cm)
                    </MDTypography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <MDInput
                          label="Ancho"
                          name="dimensions.width"
                          type="number"
                          value={productData.dimensions.width}
                          onChange={handleChange}
                          fullWidth
                          inputProps={{ min: 0, step: "0.1" }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MDInput
                          label="Alto"
                          name="dimensions.height"
                          type="number"
                          value={productData.dimensions.height}
                          onChange={handleChange}
                          fullWidth
                          inputProps={{ min: 0, step: "0.1" }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MDInput
                          label="Profundidad"
                          name="dimensions.depth"
                          type="number"
                          value={productData.dimensions.depth}
                          onChange={handleChange}
                          fullWidth
                          inputProps={{ min: 0, step: "0.1" }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Peso */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Peso (gramos)"
                      name="weight"
                      type="number"
                      value={productData.weight}
                      onChange={handleChange}
                      fullWidth
                      inputProps={{ min: 0, step: "1" }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={2} mb={1}>
                      Precios de Revendedor
                    </MDTypography>
                    <Grid container spacing={2}>
                      {Object.keys(productData.resellerPrices).map((cat) => (
                        <Grid item xs={12} sm={6} md={4} key={cat}>
                          <MDInput
                            label={`Precio Nivel ${cat.replace("cat", "")}`}
                            name={`resellerPrices.${cat}`}
                            type="number"
                            value={productData.resellerPrices[cat]}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!formErrors[`resellerPrices.${cat}`]}
                            helperText={formErrors[`resellerPrices.${cat}`]}
                            inputProps={{ min: 0, step: "1" }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* --- 7. NUEVA SECCIÓN PARA ETIQUETAS PROMOCIONALES --- */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={2} mb={1}>
                      Etiquetas Promocionales
                    </MDTypography>
                    <MDBox display="flex" flexWrap="wrap" gap={1}>
                      {labelsLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        labels.map((label) => {
                          const isSelected = selectedLabelIds.includes(label._id);
                          return (
                            <Chip
                              key={label._id}
                              icon={isSelected ? <CheckCircleIcon /> : undefined}
                              label={label.name}
                              clickable
                              onClick={() => handleLabelToggle(label._id)}
                              color={isSelected ? "info" : "secondary"}
                              variant={isSelected ? "filled" : "outlined"}
                              sx={{ fontWeight: "bold" }}
                            />
                          );
                        })
                      )}
                    </MDBox>
                  </Grid>

                  <Grid item xs={12}>
                    <MDBox mt={2}>
                      <MDTypography variant="h6" mb={1}>
                        Imágenes del Producto (Máx. 5)
                      </MDTypography>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: "block", marginBottom: "10px" }}
                      />
                      <MDBox display="flex" flexWrap="wrap" mt={2}>
                        {filePreviews.map((preview, index) => (
                          <MDBox
                            key={index}
                            width="100px"
                            height="100px"
                            mr={1}
                            mb={1}
                            borderRadius="lg"
                            overflow="hidden"
                            sx={{
                              border: ({ borders }) =>
                                `${borders.borderWidth[1]} solid ${borders.borderColor}`,
                            }}
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </MDBox>
                        ))}
                      </MDBox>
                    </MDBox>
                  </Grid>

                  <Grid item xs={12}>
                    <MDBox mt={4} mb={1} display="flex" justifyContent="flex-end">
                      <MDButton
                        variant="gradient"
                        color="secondary"
                        onClick={() => navigate("/products")}
                        disabled={productLoading || labelsLoading}
                      >
                        Cancelar
                      </MDButton>
                      <MDButton
                        variant="gradient"
                        color="info"
                        type="submit"
                        disabled={productLoading || labelsLoading}
                        sx={{ ml: 2 }}
                      >
                        {productLoading || labelsLoading ? "Creando..." : "Crear Producto"}
                      </MDButton>
                    </MDBox>
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

export default CreateProduct;
