import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

// Import the address data
import addressData from "../../utils/crAddressData.json";

function CRAddressSelector({ provincia, setProvincia, canton, setCanton, distrito, setDistrito }) {
  const [provincesList, setProvincesList] = useState([]);
  const [cantonesList, setCantonesList] = useState([]);
  const [distritosList, setDistritosList] = useState([]);

  // On mount, load provinces
  useEffect(() => {
    const provs = Object.values(addressData).map((p) => ({
      id: p.id,
      name: p.name,
    }));
    setProvincesList(provs);
  }, []);

  // When provincia changes, load cantones
  useEffect(() => {
    if (provincia) {
      const selectedProv = Object.values(addressData).find((p) => p.name === provincia);
      if (selectedProv && selectedProv.cantones) {
        const cants = Object.values(selectedProv.cantones).map((c) => ({
          id: c.id,
          name: c.name,
        }));
        setCantonesList(cants);
      } else {
        setCantonesList([]);
      }
    } else {
      setCantonesList([]);
    }
  }, [provincia]);

  // When canton changes, load distritos
  useEffect(() => {
    if (provincia && canton) {
      const selectedProv = Object.values(addressData).find((p) => p.name === provincia);
      if (selectedProv && selectedProv.cantones) {
        const selectedCanton = Object.values(selectedProv.cantones).find((c) => c.name === canton);
        if (selectedCanton && selectedCanton.distritos) {
          const dists = Object.values(selectedCanton.distritos).map((d) => ({
            id: d, // In the API, distritos are just k:v pairs
            name: d,
          }));
          setDistritosList(dists);
        } else {
          setDistritosList([]);
        }
      }
    } else {
      setDistritosList([]);
    }
  }, [provincia, canton]);

  const handleProvinciaChange = (e) => {
    setProvincia(e.target.value);
    setCanton("");
    setDistrito("");
  };

  const handleCantonChange = (e) => {
    setCanton(e.target.value);
    setDistrito("");
  };

  const handleDistritoChange = (e) => {
    setDistrito(e.target.value);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <TextField
          select
          fullWidth
          variant="outlined"
          required
          label="Provincia"
          id="provincia"
          value={provincia}
          onChange={handleProvinciaChange}
        >
          <MenuItem value="">
            <em>Seleccione una Provincia</em>
          </MenuItem>
          {provincesList.map((p) => (
            <MenuItem key={p.id} value={p.name}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
          select
          fullWidth
          variant="outlined"
          required
          disabled={!provincia}
          label="Cantón"
          id="canton"
          value={canton}
          onChange={handleCantonChange}
        >
          <MenuItem value="">
            <em>Seleccione un Cantón</em>
          </MenuItem>
          {cantonesList.map((c) => (
            <MenuItem key={c.id} value={c.name}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
          select
          fullWidth
          variant="outlined"
          required
          disabled={!canton}
          label="Distrito"
          id="distrito"
          value={distrito}
          onChange={handleDistritoChange}
        >
          <MenuItem value="">
            <em>Seleccione un Distrito</em>
          </MenuItem>
          {distritosList.map((d, idx) => (
            <MenuItem key={idx} value={d.name}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  );
}

CRAddressSelector.propTypes = {
  provincia: PropTypes.string.isRequired,
  setProvincia: PropTypes.func.isRequired,
  canton: PropTypes.string.isRequired,
  setCanton: PropTypes.func.isRequired,
  distrito: PropTypes.string.isRequired,
  setDistrito: PropTypes.func.isRequired,
};

export default CRAddressSelector;
