export const search_styles = () => `
        .product-card { transition: transform 0.2s ease, box-shadow 0.2s ease !important; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
        .archive-layout-container { display: flex; gap: 2rem; width: 100%; }
        .sidebar-wrapper { flex: 0 0 280px; width: 280px; }
        
        .master-header { width: 100%; font-family: sans-serif; }
        .top-nav-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1);padding: .5rem 2rem; }
        .search-form-wrapper { flex: 1; max-width: 500px; display: flex; position: relative; border: 1px solid #d3d3d3; border-radius:100px; }
        
        .search-input-field { 
          font-family: "Rudaw", sans-serif; /* 🌟 FIX: Fixed string name typo */
          width: 100%; 
          padding: 8px 14px; 
          padding-inline-end: 36px; 
          border-radius: 20px; 
          border: 1px solid rgba(255,255,255,0.2); 
          background: rgba(255, 255, 255, 0.1); 
          color: #1e293b; /* 🌟 FIX: Changed from white (#fff) to modern slate-gray for dark text entry */
          font-size: 14px; 
          outline: none; 
        }
        
        .search-input-field::placeholder { 
          color: #94a3b8; 
          font-family: inherit; /* 🌟 FIX: Forces placeholder string to render using Rudaw */
        }
        
        .search-input-field:focus { 
          background: rgba(255,255,255,0.15); 
          border-color: #3b82f6; 
        }
        
        .actions-cluster { display: flex; align-items: center; gap: 1.5rem; }
        .lang-picker { display: flex; align-items: center; gap: 0.75rem; fontSize: 13px; border-inline-start: 1px solid rgba(255,255,255,0.2); padding-inline-start: 1.5rem; }
        .independent-nav-row { width: 100%; background: #0f172a; }

        @media (max-width: 768px) {
          .top-nav-bar { flex-direction: column; gap: 1rem; padding: 1rem; align-items: stretch; }
          .search-form-wrapper { max-width: 100%; order: 3; }
          .actions-cluster { justify-content: space-between; order: 2; }
          .archive-layout-container { flex-direction: column !important; }
          .sidebar-wrapper { flex: 1 1 100% !important; width: 100% !important; }
        }
      `
