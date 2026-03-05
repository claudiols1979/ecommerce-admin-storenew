const isProduction = process.env.NODE_ENV === "production";

const rawUrl = isProduction ? process.env.REACT_APP_BACKEND_URL : "http://192.168.100.114:5000";
const API_URL = rawUrl ? rawUrl.replace(/\/+$/, '') : "";

export default API_URL;
