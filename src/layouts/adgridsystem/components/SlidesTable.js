import React from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDButton from "components/MDButton";
import MDConfirmationModal from "components/MDConfirmationModal";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";

// Context
import { useAdGrid } from "contexts/AdGridContext";

function SlidesTable({ onEdit, onReorder, gridItems: propGridItems }) {
  const {
    gridItems: contextGridItems,
    loading,
    deleteGridItem,
    toggleGridItemActive,
  } = useAdGrid();
  const gridItems = propGridItems || contextGridItems;
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState(null);

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteGridItem(itemToDelete);
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        setOpenDeleteModal(false);
        setItemToDelete(null);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setItemToDelete(null);
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await toggleGridItemActive(id, isActive);
    } catch (error) {
      console.error("Error toggling item status:", error);
    }
  };

  const columns = [
    { Header: "Imagen", accessor: "image", width: "10%", align: "left" },
    { Header: "Título", accessor: "title", width: "25%", align: "left" },
    { Header: "Departamento", accessor: "department", width: "20%", align: "left" },
    { Header: "Orden", accessor: "order", width: "10%", align: "center" },
    { Header: "Estado", accessor: "status", width: "15%", align: "center" },
    { Header: "Acciones", accessor: "actions", width: "20%", align: "center" },
  ];

  const rows = gridItems.map((item) => ({
    image: (
      <MDAvatar src={item.image} alt={item.alt} size="sm" variant="rounded" bgColor="transparent" />
    ),
    title: (
      <MDTypography variant="caption" fontWeight="medium">
        {item.title}
      </MDTypography>
    ),
    department: (
      <MDTypography variant="caption" color="text">
        {item.department}
      </MDTypography>
    ),
    order: (
      <MDTypography variant="caption" fontWeight="medium">
        {item.order}
      </MDTypography>
    ),
    status: (
      <MDButton
        variant="gradient"
        color={item.isActive ? "success" : "error"}
        size="small"
        onClick={() => handleToggleActive(item._id, item.isActive)}
      >
        {item.isActive ? "Activo" : "Inactivo"}
      </MDButton>
    ),
    actions: (
      <MDBox display="flex" gap={1}>
        <MDButton variant="gradient" color="info" size="small" onClick={() => onEdit(item)}>
          Editar
        </MDButton>
        <MDButton
          variant="gradient"
          color="error"
          size="small"
          onClick={() => handleDeleteClick(item._id)}
        >
          Eliminar
        </MDButton>
      </MDBox>
    ),
  }));

  return (
    <MDBox>
      <DataTable
        table={{ columns, rows }}
        loading={loading}
        entriesPerPage={false}
        showTotalEntries={false}
        isSorted={true}
        noEndBorder
      />
      <MDConfirmationModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        content="¿Estás seguro de que quieres eliminar este item? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={loading}
      />
    </MDBox>
  );
}

SlidesTable.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onReorder: PropTypes.func,
  gridItems: PropTypes.array,
};

export default SlidesTable;
