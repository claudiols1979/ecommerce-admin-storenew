import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";
import API_URL from "../config";

const VariantContext = createContext();

export const useVariants = () => {
  const context = useContext(VariantContext);
  if (!context) {
    throw new Error("useVariants must be used within a VariantProvider");
  }
  return context;
};

export const VariantProvider = ({ children }) => {
  const { user } = useAuth();
  const authToken = user?.token;

  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    if (!authToken) return null;
    return { headers: { Authorization: `Bearer ${authToken}` } };
  }, [authToken]);

  const fetchAttributes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = getAuthHeaders();
      const timestamp = new Date().getTime();
      if (!config) throw new Error("No auth token");
      const { data } = await axios.get(`${API_URL}/api/product-attributes?_t=${timestamp}`, config);
      setAttributes(data);
    } catch (err) {
      console.error("Error fetching attributes:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [authToken, API_URL, getAuthHeaders]);

  const createAttribute = useCallback(
    async (name, ref) => {
      const config = getAuthHeaders();
      if (!config) throw new Error("No auth token");
      config.headers["Content-Type"] = "application/json";
      const { data } = await axios.post(`${API_URL}/api/product-attributes`, { name, ref }, config);
      await fetchAttributes();
      return data;
    },
    [authToken, API_URL, getAuthHeaders, fetchAttributes]
  );

  const updateAttribute = useCallback(
    async (id, name, ref) => {
      const config = getAuthHeaders();
      if (!config) throw new Error("No auth token");
      config.headers["Content-Type"] = "application/json";
      const { data } = await axios.put(
        `${API_URL}/api/product-attributes/${id}`,
        { name, ref },
        config
      );
      await fetchAttributes();
      return data;
    },
    [authToken, API_URL, getAuthHeaders, fetchAttributes]
  );

  const deleteAttribute = useCallback(
    async (id) => {
      const config = getAuthHeaders();
      if (!config) throw new Error("No auth token");
      await axios.delete(`${API_URL}/api/product-attributes/${id}`, config);
      await fetchAttributes();
    },
    [authToken, API_URL, getAuthHeaders, fetchAttributes]
  );

  const addValue = useCallback(
    async (attributeId, value, ref) => {
      const config = getAuthHeaders();
      if (!config) throw new Error("No auth token");
      config.headers["Content-Type"] = "application/json";
      const { data } = await axios.post(
        `${API_URL}/api/product-attributes/${attributeId}/values`,
        { value, ref },
        config
      );
      await fetchAttributes();
      return data;
    },
    [authToken, API_URL, getAuthHeaders, fetchAttributes]
  );

  const removeValue = useCallback(
    async (attributeId, valueId) => {
      const config = getAuthHeaders();
      if (!config) throw new Error("No auth token");
      await axios.delete(
        `${API_URL}/api/product-attributes/${attributeId}/values/${valueId}`,
        config
      );
      await fetchAttributes();
    },
    [authToken, API_URL, getAuthHeaders, fetchAttributes]
  );

  return (
    <VariantContext.Provider
      value={{
        attributes,
        loading,
        error,
        fetchAttributes,
        createAttribute,
        updateAttribute,
        deleteAttribute,
        addValue,
        removeValue,
      }}
    >
      {children}
    </VariantContext.Provider>
  );
};

VariantProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default VariantContext;
