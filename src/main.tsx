import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ContentProvider, loadInitialContent} from './content/content';
import './index.css';

// Site text from Sanity: rendered once it's in hand (cached copy, or a fresh
// fetch with a short timeout), falling back to the built-in text
loadInitialContent().then((initial) => {
  createRoot(document.getElementById('root')!).render(
    <ContentProvider initial={initial}>
      <App />
    </ContentProvider>
  );
});
