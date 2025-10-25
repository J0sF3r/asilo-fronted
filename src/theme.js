// src/theme.js
import { createTheme } from '@mui/material/styles';

// Define una paleta de colores
// Verdes suaves, azules tranquilos y tonos tierra
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Un verde oscuro
    },
    secondary: {
      main: '#FFA726', // Un naranja cálido 
    },
    background: {
      default: '#F5F5F5', // Un fondo  gris 
    },
  },
  typography: {
    fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600, 
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Botones con bordes más redondeados
          textTransform: 'none', 
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