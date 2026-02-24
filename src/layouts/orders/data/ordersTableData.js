// frontend/src/layouts/orders/data/ordersTableData.js

/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

import { Link } from "react-router-dom"; // Import Link for navigation
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import Icon from "@mui/material/Icon"; // For action icons

// --- Status Translation Map ---
const statusTranslations = {
  pending: "Pendiente",
  placed: "Realizado",
  cancelled: "Cancelado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  delivered: "Entregado",
};
// --- END Status Translation Map ---

// Helper component for Reseller Info in table
const ResellerCell = ({ firstName, lastName, email }) => (
  <MDBox display="flex" flexDirection="column" alignItems="flex-start" lineHeight={1}>
    <MDTypography display="block" variant="button" fontWeight="medium">
      {firstName} {lastName}
    </MDTypography>
    {email && (
      <MDTypography variant="caption" color="text">
        {email}
      </MDTypography>
    )}
  </MDBox>
);

// Helper for Status Badge
const StatusBadge = ({ status }) => {
  let color;
  switch (status) {
    case "pending":
      color = "warning";
      break;
    case "processing":
      color = "info";
      break;
    case "shipped":
      color = "primary";
      break;
    case "delivered":
      color = "success";
      break;
    case "cancelled":
      color = "error";
      break;
    case "placed":
      color = "dark";
      break;
    case "placed":
      color = "dark";
      break;
    default:
      color = "dark";
  }

  return (
    <MDBox ml={-1}>
      {/* Using Spanish translation for badgeContent */}
      <MDBadge
        badgeContent={statusTranslations[status] || status.toUpperCase()}
        color={color}
        variant="gradient"
        size="sm"
      />
    </MDBox>
  );
};

// Main ordersTableData function now accepts 'orders', 'currentUser', and 'onStatusChange' as props
export default function ordersTableData(orders, currentUser, onStatusChange) {
  const columns = [
    { Header: "ID de Pedido", accessor: "orderId", width: "15%", align: "left" },
    { Header: "Revendedor", accessor: "reseller", width: "15%", align: "left" },
    { Header: "Destino", accessor: "destination", width: "15%", align: "left" },
    { Header: "Fecha", accessor: "orderDate", align: "center" },
    { Header: "Total", accessor: "totalAmount", align: "right" },
    { Header: "Estado", accessor: "status", align: "center" },
    { Header: "Acción", accessor: "action", align: "center" },
  ];

  const isAdminOrEditor = currentUser && ["Administrador", "Editor"].includes(currentUser.role);
  const canChangeOrderStatus = currentUser && currentUser.role === "Administrador";

  const rows = (orders || []).map((order) => {
    const orderDate = new Date(order.createdAt).toLocaleDateString("es-CR");
    const totalAmount =
      order.totalPrice?.toLocaleString("es-CR", { style: "currency", currency: "CRC" }) || "N/A";

    // Determine if the order is modifiable (i.e., not cancelled or delivered)
    const nonModifiableStatuses = ["cancelled", "delivered"];
    const isOrderModifiable = !nonModifiableStatuses.includes(order.status);

    return {
      orderId: (
        <Link to={`/orders/details/${order._id}`}>
          <MDTypography variant="caption" fontWeight="medium" color="text">
            {order.orderNumber || order._id}
          </MDTypography>
        </Link>
      ),
      reseller: (
        <ResellerCell
          firstName={order.user?.firstName || "N/A"}
          lastName={order.user?.lastName || "N/A"}
          email={order.user?.email || "N/A"} // Ensure this is correct, previously was customerDetails.email
        />
      ),
      destination: (
        <MDBox display="flex" flexDirection="column">
          <MDTypography variant="caption" fontWeight="medium" color="text">
            {[
              order.user?.provincia ||
                order.customerDetails?.provincia ||
                order.customerDetails?.province,
              order.user?.canton || order.customerDetails?.canton || order.customerDetails?.city,
              order.user?.distrito || order.customerDetails?.distrito,
            ]
              .filter((val) => val && val !== "N/A" && val !== "" && val !== "undefined")
              .join(", ") || "N/A"}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {order.user?.address ||
              (order.customerDetails?.address && order.customerDetails?.address !== "N/A"
                ? order.customerDetails.address
                : "")}
          </MDTypography>
        </MDBox>
      ),
      orderDate: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {orderDate}
        </MDTypography>
      ),
      totalAmount: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {totalAmount}
        </MDTypography>
      ),
      status: <StatusBadge status={order.status} />,
      action: (
        <MDBox display="flex" alignItems="center" lineHeight={1}>
          {isAdminOrEditor && (
            <>
              {/* Edit Icon */}
              {/* <Link to={isOrderModifiable ? `/orders/edit/${order._id}` : "#"}>
                <MDTypography
                  variant="caption"
                  color={isOrderModifiable ? "info" : "secondary"} // Grey out if not modifiable
                  fontWeight="medium"
                  sx={{
                    cursor: isOrderModifiable ? "pointer" : "not-allowed",
                    marginRight: 1,
                    opacity: isOrderModifiable ? 1 : 0.5, // Reduce opacity if greyed out
                  }}
                >
                  <Icon sx={{ fontSize: "24px" }}>edit</Icon>
                </MDTypography>
              </Link> */}
              {/* Status Change Icon (Cancel/Restore) */}
              {/* {canChangeOrderStatus && onStatusChange && (
                <MDTypography
                  component="a"
                  href="#"
                  onClick={(e) => {
                    if (isOrderModifiable) {
                      // Only allow click if modifiable
                      e.preventDefault();
                      onStatusChange(order._id, order.status);
                    } else {
                      e.preventDefault(); // Prevent default even if disabled, for consistency
                    }
                  }}
                  variant="caption"
                  color={isOrderModifiable ? "text" : "secondary"} // Grey out if not modifiable
                  fontWeight="medium"
                  sx={{
                    cursor: isOrderModifiable ? "pointer" : "not-allowed",
                    opacity: isOrderModifiable ? 1 : 0.5, // Reduce opacity if greyed out
                  }}
                >
                  <Icon color={isOrderModifiable ? "error" : "secondary"} sx={{ fontSize: "24px" }}>
                    {order.status === "cancelled" ? "" : "cancel"}
                  </Icon>
                </MDTypography>
              )} */}
            </>
          )}
          {/* View Details Icon (Always active) */}
          <Link to={`/orders/details/${order._id}`}>
            <MDTypography
              variant="caption"
              color="text"
              fontWeight="medium"
              sx={{ cursor: "pointer", marginLeft: isAdminOrEditor ? 1 : 0 }}
            >
              <Icon color="dark" sx={{ fontSize: "24px" }}>
                visibility
              </Icon>
            </MDTypography>
          </Link>
        </MDBox>
      ),
    };
  });

  return {
    columns,
    rows,
  };
}
