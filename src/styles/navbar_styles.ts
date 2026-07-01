export const getNavbarStyles = (isRtl: boolean) => `
  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: #fff;
    border-bottom: 1px solid #eaeaea;
    position: relative;
    z-index: 100;
    font-family: "Rudaw", sans-serif;
  }

  .nav-links {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    flex: 1; /* 🌟 Allows the links row to scale smoothly across the header row */
    justify-content: flex-start;
  }

  /* 🌟 NEW SPACER / ACTION STYLE:
     Pushes the PC Builder action button to the absolute opposite side of the screen 
     cooperatively regardless of LTR/RTL reading flows. */
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
    background: #0070f3;
    color: #fff;
    border-radius: 20px;
    text-decoration: none;
    transition: background 0.2s ease;
  }
  
  .pc-builder-btn:hover {
    background: #0051a8;
  }

  /* 💡 CSS DROP-DOWN STRUCTURES */
  .nav-dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-trigger {
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 600;
    color: #333;
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
    background-color: #fff;
    min-width: 210px;
    box-shadow: 0px 8px 24px rgba(0,0,0,0.08);
    border: 1px solid #eef0f2;
    border-radius: 8px;
    padding: 0.5rem 0;
    z-index: 1000;
  }

  .dropdown-content a {
    color: #444;
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

  .burger-menu {
    display: none;
    cursor: pointer;
    font-size: 1.5rem;
    user-select: none;
  }

  #menu-toggle {
    display: none;
  }

  @media (max-width: 992px) {
    .burger-menu { display: block; }
    .nav-links {
      display: none;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #fff;
      padding: 1.5rem;
      border-bottom: 1px solid #eaeaea;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      align-items: flex-start;
    }
    #menu-toggle:checked ~ .nav-links { display: flex; }
    .nav-dropdown { width: 100%; }
    .dropdown-trigger { width: 100%; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #fafafa; }
    .dropdown-content {
      position: relative;
      box-shadow: none;
      border: none;
      background: #fdfdfd;
      padding-left: ${isRtl ? '0' : '1rem'};
      padding-right: ${isRtl ? '1rem' : '0'};
      width: 100%;
      display: block;
    }
    .pc-builder-wrapper {
      width: 100%;
      margin-inline-start: 0;
    }
    .pc-builder-btn { width: 100%; text-align: center; box-sizing: border-box; margin-top: 1rem; }
  }
`
