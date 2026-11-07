import { Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class Guard extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { failed: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Diya error boundary caught:', error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="fatal">
          <p>The diya flickered out. Refresh the page to light it again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <Guard>
    <App />
  </Guard>,
);
