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
import { useAdGrid3 } from "contexts/AdGrid3Context";

function SlidesTable({ onEdit, onReorder, gridItems: propGridItems }) {
  const {
    gridItems: contextGridItems,
    loading: contextLoading,
    deleteGridItem,
    toggleGridItemActive,
  } = useAdGrid3();
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
    { Header: "imagen y título", accessor: "item", width: "40%", align: "left" },
    { Header: "botón / link", accessor: "boton", align: "left" },
    { Header: "Orden", accessor: "order", width: "10%", align: "center" },
    { Header: "Estado", accessor: "status", width: "15%", align: "center" },
    { Header: "Acciones", accessor: "actions", width: "20%", align: "center" },
  ];

  const rows = gridItems.map((item) => ({
    item: (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <MDAvatar
          src={item.image}
          alt={item.alt}
          size="sm"
          variant="rounded"
          bgColor="transparent"
          sx={{ mr: 1 }}
        />
        <MDBox>
          <MDTypography display="block" variant="button" fontWeight="medium">
            {item.title}
          </MDTypography>
          {item.alt && item.alt !== item.title && (
            <MDTypography variant="caption" color="text">
              Alt: {item.alt}
            </MDTypography>
          )}
        </MDBox>
      </MDBox>
    ),
    boton: (
      <MDBox>
        <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
          Texto: {item.buttonText}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          Link: {item.buttonLink}
        </MDTypography>
      </MDBox>
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
        <MDButton
          variant="gradient"
          color="info"
          size="small"
          onClick={() => onEdit(item)}
          disabled={contextLoading}
        >
          Editar
        </MDButton>
        <MDButton
          variant="gradient"
          color="error"
          size="small"
          onClick={() => handleDeleteClick(item._id)}
          disabled={contextLoading}
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
        loading={contextLoading}
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
        loading={contextLoading}
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
