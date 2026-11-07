import { Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class Guard extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <p className="fatal">The diya flickered out. Refresh the page to light it again.</p>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <Guard>
    <App />
  </Guard>,
);
