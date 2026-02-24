import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";
import API_URL from "../config";

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [configs, setConfigs] = useState({});
  const [systemEnv, setSystemEnv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [envLoading, setEnvLoading] = useState(false);
  const { user } = useAuth();
  const token = user?.token;

  const fetchConfigs = useCallback(async () => {
    if (!token || user?.role !== "Administrador") {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfigs(res.data);
    } catch (error) {
      console.error("Error fetching configs:", error);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const fetchSystemEnv = useCallback(async () => {
    if (!token || (user?.role !== "Administrador" && user?.role !== "Editor")) return;
    try {
      setEnvLoading(true);
      const res = await axios.get(`${API_URL}/api/config/system-env`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSystemEnv(res.data);
    } catch (error) {
      console.error("Error fetching system env:", error);
    } finally {
      setEnvLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchConfigs();
    fetchSystemEnv();
  }, [fetchConfigs, fetchSystemEnv]);

  const updateConfig = async (key, value) => {
    try {
      await axios.post(
        `${API_URL}/api/config`,
        { key, value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConfigs((prev) => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error("Error updating config:", error);
      throw error;
    }
  };

  const value = {
    configs,
    systemEnv,
    taxRegime: configs.TAX_REGIME || "traditional",
    loading,
    envLoading,
    updateConfig,
    refreshConfigs: fetchConfigs,
    refreshSystemEnv: fetchSystemEnv,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

ConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
