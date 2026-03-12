/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
/**
=========================================================
* Material Dashboard 2 React - v2.1.0
=========================================================
*/

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

export default function data(coupons, handleEdit, handleDelete) {
  const Badge = ({ color, label }) => (
    <MDBox ml={-1}>
      <MDBadge badgeContent={label} color={color} variant="gradient" size="sm" />
    </MDBox>
  );

  return {
    columns: [
      { Header: "Código", accessor: "code", align: "left" },
      { Header: "Descuento", accessor: "discount", align: "left" },
      { Header: "Estado", accessor: "status", align: "center" },
      { Header: "Vence", accessor: "expiry", align: "center" },
      { Header: "Uso", accessor: "usage", align: "center" },
      { Header: "Monto Mín.", accessor: "minAmount", align: "center" },
      { Header: "Acciones", accessor: "actions", align: "center" },
    ],

    rows: coupons.map((coupon) => ({
      code: (
        <MDTypography variant="button" fontWeight="medium">
          {coupon.code}
        </MDTypography>
      ),
      discount: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {coupon.discountPercentage}%
        </MDTypography>
      ),
      status: (
        <Badge
          color={coupon.isActive ? "success" : "error"}
          label={coupon.isActive ? "Activo" : "Inactivo"}
        />
      ),
      expiry: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "N/A"}
        </MDTypography>
      ),
      usage: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {coupon.usageCount} / {coupon.usageLimit || "∞"}
        </MDTypography>
      ),
      minAmount: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          ₡{coupon.minOrderAmount?.toLocaleString()}
        </MDTypography>
      ),
      actions: (
        <MDBox display="flex" alignItems="center">
          <MDButton variant="text" color="info" onClick={() => handleEdit(coupon)}>
            <Icon>edit</Icon>&nbsp;Editar
          </MDButton>
          <MDButton variant="text" color="error" onClick={() => handleDelete(coupon._id)}>
            <Icon>delete</Icon>&nbsp;Eliminar
          </MDButton>
        </MDBox>
      ),
    })),
  };
}
