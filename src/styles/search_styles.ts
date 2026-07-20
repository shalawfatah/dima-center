export const search_styles = () => `
  .product-card { transition: transform 0.2s ease, box-shadow 0.2s ease !important; }
  .product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
  .archive-layout-container { display: flex; gap: 2rem; width: 100%; }
  .sidebar-wrapper { flex: 0 0 280px; width: 280px; }
  
  .master-header { width: 100%; font-family: sans-serif; }
  
  .top-nav-bar { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    padding: 0.50rem 2rem; 
    gap: 1.5rem;
    background: var(--brand-background);
    position: relative;
    z-index: 1000;
  }

  .logo-link-container {
    text-decoration: none;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .logo-link-container img {
    height: auto;
    max-width: 100%;
  }
  
  .actions-cluster { 
    display: flex; 
    align-items: center; 
    gap: .25rem; 
    flex-shrink: 0;
  }
  
  .independent-nav-row { 
    background: #ffffff; 
  }

  @media (max-width: 768px) {
    /* Holds line elements inline elegantly without stacking columns */
    .top-nav-bar { 
      flex-wrap: nowrap;
      padding: 0.75rem 1rem;
      gap: 1rem;
    }

    .logo-link-container {
      width: 60px;
      max-width: 60px;
    }
    
    .actions-cluster {
      margin-inline-start: 0;
      gap: 0.75rem;
    }
  }
`
