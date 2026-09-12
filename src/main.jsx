import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class Boundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() { return this.state.error ? <main className="startup"><h1>Something interrupted this page.</h1><p>Your saved notebook has not been erased. Reload to try again.</p><button onClick={() => location.reload()}>Reload</button></main> : this.props.children; }
}
createRoot(document.getElementById('root')).render(<Boundary><App /></Boundary>);
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
