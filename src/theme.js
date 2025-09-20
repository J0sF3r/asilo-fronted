// src/theme.js
import { createTheme } from '@mui/material/styles';

// Define una paleta de colores que transmite calma y cuidado.
// Verdes suaves, azules tranquilos y tonos tierra son excelentes opciones.
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Un verde oscuro, sereno y profesional
    },
    secondary: {
      main: '#FFA726', // Un naranja cálido y amigable, como el de un atardecer
    },
    background: {
      default: '#F5F5F5', // Un fondo ligeramente gris para no cansar la vista
    },
  },
  typography: {
    fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600, // Hacemos los títulos un poco más audaces
    },
  },
  components: {
    // Personalizamos el estilo por defecto de algunos componentes
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Botones con bordes más redondeados y amigables
          textTransform: 'none', // Quitamos la transformación a mayúsculas
          fontWeight: 'bold',
        },
      },
    },
    MuiTextField: {
        styleOverrides: {
          root: {
            '& label.Mui-focused': {
              color: '#2E7D32', // Color del label al hacer foco
            },
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#2E7D32', // Color del borde al hacer foco
              },
            },
          },
        },
      },
  },
});

export default theme;