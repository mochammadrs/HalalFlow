import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Logo from './components/Logo';

test('renders HalalFlow logo without crashing', () => {
  render(
    <ThemeProvider>
      <Logo />
    </ThemeProvider>
  );
});
