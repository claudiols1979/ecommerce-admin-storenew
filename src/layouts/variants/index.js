import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";

// @mui icons
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddIcon from "@mui/icons-material/Add";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useVariants } from "contexts/VariantContext";
import { useMaterialUIController } from "context";

function Variants() {
  const {
    attributes,
    loading,
    fetchAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    addValue,
    removeValue,
  } = useVariants();

  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  // Estado para crear nuevo atributo
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrRef, setNewAttrRef] = useState("");

  // Estado para agregar valor a un atributo
  const [valueInputs, setValueInputs] = useState({}); // { [attrId]: { value: '', ref: '' } }

  // Estado para expandir/colapsar atributos
  const [expanded, setExpanded] = useState({});

  // Estado para editar atributo
  const [editDialog, setEditDialog] = useState({ open: false, id: null, name: "", ref: "" });

  // Estado para confirmar eliminación
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: "" });

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateAttribute = async () => {
    if (!newAttrName.trim() || !newAttrRef.trim()) {
      toast.error("Nombre y referencia son requeridos.");
      return;
    }
    try {
      await createAttribute(newAttrName.trim(), newAttrRef.trim());
      setNewAttrName("");
      setNewAttrRef("");
      toast.success("Atributo creado exitosamente.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al crear atributo.");
    }
  };

  const handleAddValue = async (attrId) => {
    const input = valueInputs[attrId];
    if (!input?.value?.trim() || !input?.ref?.trim()) {
      toast.error("Valor y referencia son requeridos.");
      return;
    }
    try {
      await addValue(attrId, input.value.trim(), input.ref.trim());
      setValueInputs((prev) => ({ ...prev, [attrId]: { value: "", ref: "" } }));
      toast.success("Valor agregado.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al agregar valor.");
    }
  };

  const handleRemoveValue = async (attrId, valueId) => {
    try {
      await removeValue(attrId, valueId);
      toast.success("Valor eliminado.");
    } catch (err) {
      toast.error("Error al eliminar valor.");
    }
  };

  const handleEditSave = async () => {
    try {
      await updateAttribute(editDialog.id, editDialog.name, editDialog.ref);
      setEditDialog({ open: false, id: null, name: "", ref: "" });
      toast.success("Atributo actualizado.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al actualizar.");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAttribute(deleteDialog.id);
      setDeleteDialog({ open: false, id: null, name: "" });
      toast.success("Atributo eliminado.");
    } catch (err) {
      toast.error("Error al eliminar atributo.");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} lg={10}>
            {/* --- CREAR NUEVO ATRIBUTO --- */}
            <Card sx={{ mb: 4 }}>
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
                  Crear Nuevo Atributo de Variante
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <MDInput
                      label="Nombre del Atributo"
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      fullWidth
                      placeholder="ej: Volumen, Color, Talla"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MDInput
                      label="Referencia (código)"
                      value={newAttrRef}
                      onChange={(e) => setNewAttrRef(e.target.value.toUpperCase())}
                      fullWidth
                      placeholder="ej: VOL, COL, TAL"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleCreateAttribute}
                      disabled={loading}
                      fullWidth
                    >
                      <AddIcon sx={{ mr: 1 }} />
                      Crear Atributo
                    </MDButton>
                  </Grid>
                </Grid>
                <MDBox mt={1}>
                  <MDTypography variant="caption" color="text">
                    La referencia se usa en la nomenclatura del código de producto (ej:
                    PROD-001_100ML)
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>

            {/* --- LISTA DE ATRIBUTOS --- */}
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
                  Atributos de Variantes
                </MDTypography>
                <MDTypography variant="caption" color="white" opacity={0.8}>
                  {attributes.length} atributo{attributes.length !== 1 ? "s" : ""}
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {loading && attributes.length === 0 ? (
                  <MDBox display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </MDBox>
                ) : attributes.length === 0 ? (
                  <MDTypography variant="body2" color="text" textAlign="center" py={4}>
                    No hay atributos creados. Crea el primero arriba.
                  </MDTypography>
                ) : (
                  attributes.map((attr) => (
                    <MDBox
                      key={attr._id}
                      mb={2}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      {/* Encabezado del atributo */}
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        px={2}
                        py={1.5}
                        sx={{
                          backgroundColor: "action.hover",
                          cursor: "pointer",
                        }}
                        onClick={() => toggleExpand(attr._id)}
                      >
                        <MDBox display="flex" alignItems="center" gap={1}>
                          {expanded[attr._id] ? (
                            <ExpandLessIcon
                              sx={(theme) => ({
                                color:
                                  theme.palette.mode === "dark" || darkMode
                                    ? "#fff"
                                    : "rgba(0,0,0,0.87)",
                              })}
                            />
                          ) : (
                            <ExpandMoreIcon
                              sx={(theme) => ({
                                color:
                                  theme.palette.mode === "dark" || darkMode
                                    ? "#fff"
                                    : "rgba(0,0,0,0.87)",
                              })}
                            />
                          )}
                          <MDTypography
                            variant="h6"
                            fontWeight="medium"
                            sx={(theme) => ({
                              color:
                                theme.palette.mode === "dark" || darkMode
                                  ? "#fff !important"
                                  : "rgba(0,0,0,0.87) !important",
                            })}
                          >
                            {attr.name}
                          </MDTypography>
                          <Chip label={attr.ref} size="small" color="info" variant="outlined" />
                          <MDTypography
                            variant="caption"
                            ml={1}
                            sx={(theme) => ({
                              color:
                                theme.palette.mode === "dark" || darkMode
                                  ? "rgba(255,255,255,0.7) !important"
                                  : "rgba(0,0,0,0.6) !important",
                            })}
                          >
                            ({attr.values.length} valor{attr.values.length !== 1 ? "es" : ""})
                          </MDTypography>
                        </MDBox>
                        <MDBox>
                          <IconButton
                            size="small"
                            sx={(theme) => ({
                              color:
                                theme.palette.mode === "dark" || darkMode
                                  ? "#fff"
                                  : "rgba(0,0,0,0.54)",
                            })}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditDialog({
                                open: true,
                                id: attr._id,
                                name: attr.name,
                                ref: attr.ref,
                              });
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({
                                open: true,
                                id: attr._id,
                                name: attr.name,
                              });
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </MDBox>
                      </MDBox>

                      <Collapse in={expanded[attr._id]}>
                        <Divider sx={{ m: 0 }} />
                        <MDBox px={2} py={2}>
                          {/* Valores existentes */}
                          <MDBox display="flex" flexWrap="wrap" gap={1} mb={2}>
                            {attr.values.length === 0 ? (
                              <MDTypography
                                variant="caption"
                                sx={(theme) => ({
                                  color:
                                    theme.palette.mode === "dark" || darkMode
                                      ? "rgba(255,255,255,0.7)"
                                      : "text.secondary",
                                })}
                              >
                                Sin valores. Agrega el primero abajo.
                              </MDTypography>
                            ) : (
                              attr.values.map((val) => (
                                <Chip
                                  key={val._id}
                                  label={`${val.value} (${val.ref})`}
                                  onDelete={() => handleRemoveValue(attr._id, val._id)}
                                  color="default"
                                  variant="outlined"
                                  sx={(theme) => ({
                                    fontWeight: "medium",
                                    color:
                                      theme.palette.mode === "dark" || darkMode
                                        ? "#fff"
                                        : "rgba(0,0,0,0.87)",
                                    borderColor:
                                      theme.palette.mode === "dark" || darkMode
                                        ? "rgba(255,255,255,0.3)"
                                        : "rgba(0,0,0,0.23)",
                                    "& .MuiChip-deleteIcon": {
                                      color:
                                        theme.palette.mode === "dark" || darkMode
                                          ? "rgba(255,255,255,0.7)"
                                          : "rgba(0,0,0,0.5)",
                                      "&:hover": {
                                        color:
                                          theme.palette.mode === "dark" || darkMode
                                            ? "#fff"
                                            : "rgba(0,0,0,0.7)",
                                      },
                                    },
                                  })}
                                />
                              ))
                            )}
                          </MDBox>

                          {/* Agregar nuevo valor */}
                          <Grid container spacing={1} alignItems="center">
                            <Grid item xs={12} sm={4}>
                              <MDInput
                                label="Valor"
                                size="small"
                                value={valueInputs[attr._id]?.value || ""}
                                onChange={(e) =>
                                  setValueInputs((prev) => ({
                                    ...prev,
                                    [attr._id]: {
                                      ...prev[attr._id],
                                      value: e.target.value,
                                    },
                                  }))
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") handleAddValue(attr._id);
                                }}
                                fullWidth
                                placeholder="ej: 100ml, Rojo, XL"
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <MDInput
                                label="Referencia"
                                size="small"
                                value={valueInputs[attr._id]?.ref || ""}
                                onChange={(e) =>
                                  setValueInputs((prev) => ({
                                    ...prev,
                                    [attr._id]: {
                                      ...prev[attr._id],
                                      ref: e.target.value,
                                    },
                                  }))
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") handleAddValue(attr._id);
                                }}
                                fullWidth
                                placeholder="ej: 100ML, RED, XL"
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <MDButton
                                variant="outlined"
                                color="info"
                                size="small"
                                onClick={() => handleAddValue(attr._id)}
                                disabled={loading}
                              >
                                <AddIcon sx={{ mr: 0.5 }} />
                                Agregar valor
                              </MDButton>
                            </Grid>
                          </Grid>
                        </MDBox>
                      </Collapse>
                    </MDBox>
                  ))
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Dialog para editar atributo */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ ...editDialog, open: false })}>
        <DialogTitle>Editar Atributo</DialogTitle>
        <DialogContent>
          <MDBox mt={1} display="flex" flexDirection="column" gap={2}>
            <MDInput
              label="Nombre"
              value={editDialog.name}
              onChange={(e) => setEditDialog((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <MDInput
              label="Referencia"
              value={editDialog.ref}
              onChange={(e) =>
                setEditDialog((prev) => ({ ...prev, ref: e.target.value.toUpperCase() }))
              }
              fullWidth
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton color="secondary" onClick={() => setEditDialog({ ...editDialog, open: false })}>
            Cancelar
          </MDButton>
          <MDButton color="info" onClick={handleEditSave}>
            Guardar
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Dialog para confirmar eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2">
            ¿Estás seguro de eliminar el atributo &quot;{deleteDialog.name}&quot; y todos sus
            valores?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton
            color="secondary"
            onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
          >
            Cancelar
          </MDButton>
          <MDButton color="error" onClick={handleDeleteConfirm}>
            Eliminar
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Variants;
