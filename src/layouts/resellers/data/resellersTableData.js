// frontend/src/layouts/resellers/data/resellersTableData.js
/* eslint-disable */
import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import PropTypes from "prop-types";

// @mui material components
import Icon from "@mui/material/Icon";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// --- Helper Components for Table Cells ---

// Component for Reseller Name and Email
// Now includes resellerId to create a clickable link
const ResellerInfoCell = ({ firstName, lastName, email, resellerId }) => (
  <MDBox display="flex" flexDirection="column">
    {/* Reseller Name as a Link to details page */}
    <MDTypography
      component={Link} // Use Link component
      to={`/resellers/details/${resellerId}`} // Navigate to reseller details route
      variant="button"
      fontWeight="medium"
      sx={{
        cursor: "pointer",
        "&:hover": {
          textDecoration: "underline", // Add underline on hover for link indication
        },
      }}
    >
      {firstName} {lastName}
    </MDTypography>
    <MDTypography variant="caption" color="text">
      {email}
    </MDTypography>
  </MDBox>
);

ResellerInfoCell.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  resellerId: PropTypes.string.isRequired, // Add resellerId to propTypes
};

// Component for Reseller Code
const ResellerCodeCell = ({ code }) => (
  <MDTypography variant="caption" fontWeight="medium" color="text">
    {code}
  </MDTypography>
);

ResellerCodeCell.propTypes = {
  code: PropTypes.string.isRequired,
};

// Component for Reseller Category
const ResellerCategoryCell = ({ category }) => {
  const categories = {
    cat1: "Nivel 1",
    cat2: "Nivel 2",
    cat3: "Nivel 3",
    cat4: "Nivel 4",
    cat5: "Nivel 5",
  };

  return (
    <MDTypography variant="caption" fontWeight="medium" color="info">
      {categories[category] || category.toUpperCase()}
    </MDTypography>
  );
};

ResellerCategoryCell.propTypes = {
  category: PropTypes.string.isRequired,
};

ResellerCategoryCell.propTypes = {
  category: PropTypes.string.isRequired,
};

// Component for Status Toggle (Block/Unblock)
const StatusToggleCell = ({ isBlocked, onToggleBlock, resellerId, canManageResellers }) => (
  <MDBox display="flex" alignItems="center">
    <Switch
      checked={!isBlocked}
      onChange={() => onToggleBlock(resellerId)}
      color="success"
      disabled={!canManageResellers}
    />
    <MDTypography variant="caption" fontWeight="medium" color={isBlocked ? "error" : "success"}>
      {isBlocked ? "Bloqueado" : "Activo"}
    </MDTypography>
  </MDBox>
);

StatusToggleCell.propTypes = {
  isBlocked: PropTypes.bool.isRequired,
  onToggleBlock: PropTypes.func.isRequired,
  resellerId: PropTypes.string.isRequired,
  canManageResellers: PropTypes.bool.isRequired,
};

// Component for Action Buttons (Edit, Delete - Reset Code is removed)
const ActionButtons = ({
  resellerId,
  onDeleteReseller,
  canManageResellers,
  canDeleteResellers,
}) => {
  // Add these console logs for debugging
  console.log(`ActionButtons for ID ${resellerId}:`);
  console.log(`  canManageResellers: ${canManageResellers}`);
  console.log(`  canDeleteResellers: ${canDeleteResellers}`);

  return (
    <MDBox display="flex" alignItems="center">
      {/* Edit Icon */}
      {canManageResellers && (
        <MDTypography
          component={Link}
          to={`/resellers/edit/${resellerId}`} // Route for editing a reseller
          variant="caption"
          color="text"
          fontWeight="medium"
          sx={{ cursor: "pointer", mr: 1 }}
        >
          <Icon color="info" sx={{ fontSize: "24px" }}>
            edit
          </Icon>
        </MDTypography>
      )}

      {/* Delete Icon */}
      {canDeleteResellers && (
        <MDTypography
          component="a"
          href="#"
          onClick={() => onDeleteReseller(resellerId)}
          variant="caption"
          color="text"
          fontWeight="medium"
          sx={{ cursor: "pointer" }}
        >
          <Icon color="error" sx={{ fontSize: "24px" }}>
            delete
          </Icon>
        </MDTypography>
      )}
    </MDBox>
  );
};

ActionButtons.propTypes = {
  resellerId: PropTypes.string.isRequired,
  onDeleteReseller: PropTypes.func.isRequired,
  canManageResellers: PropTypes.bool.isRequired,
  canDeleteResellers: PropTypes.bool.isRequired,
};

// --- Main Data Export Functions ---

// Defines the columns for the DataTable
export const resellersTableColumns = [
  {
    Header: "Nombre y Correo",
    accessor: "resellerInfo",
    width: "25%",
    Cell: ({ cell: { value } }) => (
      <ResellerInfoCell
        firstName={value.firstName}
        lastName={value.lastName}
        email={value.email}
        resellerId={value._id} // Pass the reseller's ID for the link
      />
    ),
  },
  {
    Header: "Código de Revendedor",
    accessor: "resellerCode",
    width: "15%",
    Cell: ({ cell: { value } }) => <ResellerCodeCell code={value} />,
  },
  {
    Header: "Categoría",
    accessor: "resellerCategory",
    width: "10%",
    Cell: ({ cell: { value } }) => <ResellerCategoryCell category={value} />,
  },
  {
    Header: "Teléfono",
    accessor: "phoneNumber",
    width: "15%",
    Cell: ({ cell: { value } }) => (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {value || "N/A"}
      </MDTypography>
    ),
  },
  {
    Header: "Dirección",
    accessor: "addressInfo",
    width: "20%",
    Cell: ({ cell: { value } }) => (
      <MDBox display="flex" flexDirection="column">
        <MDTypography variant="caption" fontWeight="medium" color="text">
          {[value.provincia, value.canton, value.distrito]
            .filter((val) => val && val !== "N/A" && val !== "")
            .join(", ") || "Sin ubicación"}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {value.address || ""}
        </MDTypography>
      </MDBox>
    ),
  },
  {
    Header: "Estado",
    accessor: "isBlocked",
    width: "10%",
    // Cell rendered in rows
  },
  {
    Header: "Acciones",
    accessor: "actions",
    width: "15%",
    // This cell's content will be dynamically generated by the `resellersTableRows` function
    // to pass the necessary handlers and access control props.
  },
];

// Transforms the raw reseller data into rows for the DataTable
export const resellersTableRows = (
  filteredResellers,
  handleDeleteReseller,
  handleResetCode, // Kept for compatibility if used elsewhere, though ActionButtons logic below might need it
  onToggleBlock,
  canManageResellers,
  canDeleteResellers
) => {
  return filteredResellers.map((reseller) => ({
    resellerInfo: reseller, // Pass entire object for Name and Email cell (becomes 'value')
    resellerCode: reseller.resellerCode,
    resellerCategory: reseller.resellerCategory,
    phoneNumber: reseller.phoneNumber,
    addressInfo: {
      provincia: reseller.provincia || reseller.province,
      canton: reseller.canton || reseller.city,
      distrito: reseller.distrito,
      address: reseller.address,
    },
    isBlocked: (
      <StatusToggleCell
        isBlocked={reseller.isBlocked || false}
        onToggleBlock={onToggleBlock}
        resellerId={reseller._id}
        canManageResellers={canManageResellers}
      />
    ),
    // Render the ActionButtons component here
    actions: (
      <ActionButtons
        resellerId={reseller._id}
        onDeleteReseller={handleDeleteReseller}
        canManageResellers={canManageResellers}
        canDeleteResellers={canDeleteResellers}
      />
    ),
  }));
};
