import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";

export default function claimsTableData(claims, onViewClaim) {
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "error";
      case "in-progress":
        return "info";
      case "resolved":
        return "success";
      case "closed":
        return "dark";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "Abierto";
      case "in-progress":
        return "En Proceso";
      case "resolved":
        return "Resuelto";
      case "closed":
        return "Cerrado";
      default:
        return status;
    }
  };

  return {
    columns: [
      { Header: "Usuario", accessor: "user", align: "left" },
      { Header: "Asunto", accessor: "subject", align: "left" },
      { Header: "Orden", accessor: "order", align: "center" },
      { Header: "Estado", accessor: "status", align: "center" },
      { Header: "Fecha", accessor: "date", align: "center" },
      { Header: "Acción", accessor: "action", align: "center" },
    ],

    rows: claims.map((claim) => ({
      user: (
        <MDBox display="flex" alignItems="center" lineHeight={1}>
          <MDBox ml={2} lineHeight={1}>
            <MDTypography display="block" variant="button" fontWeight="medium">
              {claim.user?.firstName} {claim.user?.lastName}
            </MDTypography>
            <MDTypography variant="caption">{claim.user?.email}</MDTypography>
          </MDBox>
        </MDBox>
      ),
      subject: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {claim.subject}
        </MDTypography>
      ),
      order: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {claim.order ? `#${claim.order._id.slice(-6)}` : "N/A"}
        </MDTypography>
      ),
      status: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={getStatusLabel(claim.status)}
            color={getStatusColor(claim.status)}
            variant="gradient"
            size="sm"
          />
        </MDBox>
      ),
      date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {new Date(claim.createdAt).toLocaleDateString()}
        </MDTypography>
      ),
      action: (
        <MDButton variant="text" color="info" onClick={() => onViewClaim(claim)}>
          Ver Detalle
        </MDButton>
      ),
    })),
  };
}
