export const getNavbarStyles = (isRtl: boolean) => `
  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: var(--brand-background);
    position: relative;
    z-index: 100;
    font-family: "Rudaw", sans-serif;
    box-sizing: border-box;
  }

  .nav-links {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    flex: 1;
    justify-content: flex-start;
  }

  .pc-builder-wrapper {
    margin-inline-start: auto; 
    display: flex;
    align-items: center;
  }

  .pc-builder-btn {
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    padding: 0.6rem 1.2rem;
    background: #df8026;
    color: #fff;
    border-radius: 20px;
    text-decoration: none;
    transition: background 0.2s ease;
  }
  
  .pc-builder-btn:hover {
    background: #c66f1c;
  }

  /* CSS DROP-DOWN STRUCTURES */
  .nav-dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-trigger {
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    padding: 0.5rem 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit; 
  }

  .dropdown-content {
    display: none;
    position: absolute;
    top: 100%;
    ${isRtl ? 'right: 0;' : 'left: 0;'}
    background-color: #ffffff;
    min-width: 210px;
    box-shadow: 0px 8px 24px rgba(0,0,0,0.08);
    border: 1px solid #eef0f2;
    border-radius: 8px;
    padding: 0.5rem 0;
    z-index: 1000;
  }

  .dropdown-content a {
    color: #444444;
    padding: 0.6rem 1.2rem;
    text-decoration: none;
    display: block;
    font-size: 14px;
    text-align: ${isRtl ? 'right' : 'left'};
    transition: background 0.15s ease;
    font-family: inherit;
  }

  .dropdown-content a:hover {
    background-color: #f5f7fa;
    color: #0070f3;
  }

  .nav-dropdown:hover .dropdown-content {
    display: block;
  }

  /* 🎯 BURGER MENU FIX: Enforces modern slate coloring instead of breaking white-on-white text entries */
  .burger-menu {
    display: none;
    cursor: pointer;
    font-size: 1.75rem;
    line-height: 1;
    color: #0f172a !important;
    user-select: none;
    padding: 4px;
    z-index: 101;
  }

  #menu-toggle {
    display: none;
  }

  /* 📱 MOBILE NAVIGATION BAR VIEWPORT RESPONSIVENESS */
  @media (max-width: 992px) {
    .nav-container {
      padding: 0.75rem 1.25rem;
      flex-wrap: wrap;
    }

    .burger-menu { 
      display: block; 
      order: 1;
    }

    .pc-builder-wrapper {
      order: 2;
      margin-inline-start: auto;
      width: auto;
    }

    .pc-builder-btn {
      margin-top: 0 !important;
      padding: 0.4rem 1rem;
      font-size: 13px;
    }

    .nav-links {
      display: none;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      width: 100%;
      background: var(--brand-background);
      padding: 1rem 1.25rem;
      border-bottom: 2px solid #e2e8f0;
      gap: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
      align-items: flex-start;
      order: 3;
      box-sizing: border-box;
    }

    #menu-toggle:checked ~ .nav-links { 
      display: flex; 
    }

    .nav-dropdown { 
      width: 100%; 
    }

    .dropdown-trigger { 
      width: 100%; 
      justify-content: space-between; 
      padding: 0.75rem 0; 
      border-bottom: 1px solid #f1f5f9; 
      color: #0f172a;
    }

    .dropdown-content {
      position: relative;
      box-shadow: none;
      border: none;
      background: #f8fafc;
      padding-left: ${isRtl ? '0' : '0.75rem'};
      padding-right: ${isRtl ? '0.75rem' : '0'};
      width: 100%;
      display: block;
      top: 0;
    }

    .dropdown-content a {
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
    }
  }
`
