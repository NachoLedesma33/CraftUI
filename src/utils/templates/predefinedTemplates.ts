import type { Template, TemplateData } from "@/types/template";
import { v4 as uuidv4 } from "uuid";

/**
 * Plantillas predefinidas del sistema
 * Sirven como punto de partida para inspiran al usuario
 */

function createPlaceholderThumbnail(): string {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==";
}

// ========== LANDING PAGE ==========
const LANDING_PAGE_TEMPLATE: Template = {
  id: "template-landing-page",
  name: "SaaS Landing Page",
  description:
    "Professional landing page with hero section, features grid, pricing table, and footer",
  category: "landing",
  thumbnail: createPlaceholderThumbnail(),
  tags: ["landing", "saas", "business", "responsive"],
  isSystem: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  data: {
    components: {
      "root-landing": {
        id: "root-landing",
        type: "container",
        props: {},
        styles: {
          display: { base: "block" },
          width: { base: "100%" },
          backgroundColor: { base: "#ffffff" },
        },
        parent: null,
        children: ["header-1", "hero-1", "features-1", "pricing-1", "footer-1"],
        metadata: { isVisible: true, isLocked: false, name: "Root" },
      },
      "header-1": {
        id: "header-1",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "row" },
          justifyContent: { base: "space-between" },
          alignItems: { base: "center" },
          padding: { base: "20px 40px" },
          backgroundColor: { base: "#f8f9fa" },
          borderBottom: { base: "1px solid #e0e0e0" },
        },
        parent: "root-landing",
        children: ["logo-1", "nav-1"],
        metadata: { isVisible: true, isLocked: false, name: "Header" },
      },
      "logo-1": {
        id: "logo-1",
        type: "text",
        props: { text: "YourBrand" },
        styles: {
          fontSize: { base: "24px" },
          fontWeight: { base: "700" },
          color: { base: "#000000" },
        },
        parent: "header-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Logo" },
      },
      "nav-1": {
        id: "nav-1",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          gap: { base: "30px" },
          flexDirection: { base: "row" },
        },
        parent: "header-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Navigation" },
      },
      "hero-1": {
        id: "hero-1",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "column" },
          justifyContent: { base: "center" },
          alignItems: { base: "center" },
          padding: { base: "80px 40px" },
          backgroundColor: { base: "#f0f4ff" },
          minHeight: { base: "400px" },
          textAlign: { base: "center" },
        },
        parent: "root-landing",
        children: ["hero-title-1", "hero-subtitle-1", "hero-button-1"],
        metadata: { isVisible: true, isLocked: false, name: "Hero" },
      },
      "hero-title-1": {
        id: "hero-title-1",
        type: "text",
        props: { text: "Welcome to Your SaaS Platform" },
        styles: {
          fontSize: { base: "48px" },
          fontWeight: { base: "700" },
          color: { base: "#000000" },
          marginBottom: { base: "20px" },
        },
        parent: "hero-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Hero Title" },
      },
      "hero-subtitle-1": {
        id: "hero-subtitle-1",
        type: "text",
        props: { text: "Build amazing things with our platform" },
        styles: {
          fontSize: { base: "18px" },
          color: { base: "#666666" },
          marginBottom: { base: "40px" },
        },
        parent: "hero-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Hero Subtitle" },
      },
      "hero-button-1": {
        id: "hero-button-1",
        type: "button",
        props: { text: "Get Started", type: "button" },
        styles: {
          padding: { base: "15px 40px" },
          backgroundColor: { base: "#007bff" },
          color: { base: "#ffffff" },
          borderRadius: { base: "8px" },
          fontSize: { base: "16px" },
          fontWeight: { base: "600" },
          cursor: { base: "pointer" },
        },
        parent: "hero-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "CTA Button" },
      },
      "features-1": {
        id: "features-1",
        type: "grid",
        props: {},
        styles: {
          display: { base: "grid" },
          gridTemplateColumns: { base: "1fr 1fr 1fr" },
          gap: { base: "30px" },
          padding: { base: "60px 40px" },
          backgroundColor: { base: "#ffffff" },
        },
        parent: "root-landing",
        children: ["feature-1", "feature-2", "feature-3"],
        metadata: { isVisible: true, isLocked: false, name: "Features Grid" },
      },
      "feature-1": {
        id: "feature-1",
        type: "box",
        props: {},
        styles: {
          padding: { base: "30px" },
          backgroundColor: { base: "#f8f9fa" },
          borderRadius: { base: "8px" },
          textAlign: { base: "center" },
        },
        parent: "features-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Feature 1" },
      },
      "feature-2": {
        id: "feature-2",
        type: "box",
        props: {},
        styles: {
          padding: { base: "30px" },
          backgroundColor: { base: "#f8f9fa" },
          borderRadius: { base: "8px" },
          textAlign: { base: "center" },
        },
        parent: "features-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Feature 2" },
      },
      "feature-3": {
        id: "feature-3",
        type: "box",
        props: {},
        styles: {
          padding: { base: "30px" },
          backgroundColor: { base: "#f8f9fa" },
          borderRadius: { base: "8px" },
          textAlign: { base: "center" },
        },
        parent: "features-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Feature 3" },
      },
      "pricing-1": {
        id: "pricing-1",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "column" },
          alignItems: { base: "center" },
          padding: { base: "60px 40px" },
          backgroundColor: { base: "#f8f9fa" },
        },
        parent: "root-landing",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Pricing" },
      },
      "footer-1": {
        id: "footer-1",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          justifyContent: { base: "center" },
          padding: { base: "30px" },
          backgroundColor: { base: "#2c3e50" },
          color: { base: "#ffffff" },
          textAlign: { base: "center" },
        },
        parent: "root-landing",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Footer" },
      },
    },
    rootId: "root-landing",
    version: "1.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

// ========== ADMIN DASHBOARD ==========
const ADMIN_DASHBOARD_TEMPLATE: Template = {
  id: "template-admin-dashboard",
  name: "Admin Dashboard",
  description:
    "Complete dashboard layout with sidebar, navbar, and metric cards",
  category: "dashboard",
  thumbnail: createPlaceholderThumbnail(),
  tags: ["dashboard", "admin", "business", "metrics"],
  isSystem: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  data: {
    components: {
      "root-dashboard": {
        id: "root-dashboard",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "row" },
          width: { base: "100%" },
          height: { base: "100vh" },
          backgroundColor: { base: "#f5f5f5" },
        },
        parent: null,
        children: ["sidebar-1", "main-content-1"],
        metadata: { isVisible: true, isLocked: false, name: "Root" },
      },
      "sidebar-1": {
        id: "sidebar-1",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "column" },
          width: { base: "250px" },
          backgroundColor: { base: "#2c3e50" },
          padding: { base: "20px" },
          color: { base: "#ffffff" },
        },
        parent: "root-dashboard",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Sidebar" },
      },
      "main-content-1": {
        id: "main-content-1",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "column" },
          flex: { base: "1" },
          overflow: { base: "auto" },
        },
        parent: "root-dashboard",
        children: ["navbar-1", "dashboard-content-1"],
        metadata: { isVisible: true, isLocked: false, name: "Main Content" },
      },
      "navbar-1": {
        id: "navbar-1",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          justifyContent: { base: "space-between" },
          alignItems: { base: "center" },
          padding: { base: "20px 40px" },
          backgroundColor: { base: "#ffffff" },
          borderBottom: { base: "1px solid #e0e0e0" },
        },
        parent: "main-content-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Navbar" },
      },
      "dashboard-content-1": {
        id: "dashboard-content-1",
        type: "grid",
        props: {},
        styles: {
          display: { base: "grid" },
          gridTemplateColumns: { base: "1fr 1fr 1fr 1fr" },
          gap: { base: "20px" },
          padding: { base: "40px" },
        },
        parent: "main-content-1",
        children: [
          "metric-card-1",
          "metric-card-2",
          "metric-card-3",
          "metric-card-4",
        ],
        metadata: { isVisible: true, isLocked: false, name: "Dashboard Grid" },
      },
      "metric-card-1": {
        id: "metric-card-1",
        type: "box",
        props: {},
        styles: {
          padding: { base: "20px" },
          backgroundColor: { base: "#ffffff" },
          borderRadius: { base: "8px" },
          boxShadow: { base: "0 2px 4px rgba(0,0,0,0.1)" },
        },
        parent: "dashboard-content-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Metric Card 1" },
      },
      "metric-card-2": {
        id: "metric-card-2",
        type: "box",
        props: {},
        styles: {
          padding: { base: "20px" },
          backgroundColor: { base: "#ffffff" },
          borderRadius: { base: "8px" },
          boxShadow: { base: "0 2px 4px rgba(0,0,0,0.1)" },
        },
        parent: "dashboard-content-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Metric Card 2" },
      },
      "metric-card-3": {
        id: "metric-card-3",
        type: "box",
        props: {},
        styles: {
          padding: { base: "20px" },
          backgroundColor: { base: "#ffffff" },
          borderRadius: { base: "8px" },
          boxShadow: { base: "0 2px 4px rgba(0,0,0,0.1)" },
        },
        parent: "dashboard-content-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Metric Card 3" },
      },
      "metric-card-4": {
        id: "metric-card-4",
        type: "box",
        props: {},
        styles: {
          padding: { base: "20px" },
          backgroundColor: { base: "#ffffff" },
          borderRadius: { base: "8px" },
          boxShadow: { base: "0 2px 4px rgba(0,0,0,0.1)" },
        },
        parent: "dashboard-content-1",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Metric Card 4" },
      },
    },
    rootId: "root-dashboard",
    version: "1.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

// ========== PORTFOLIO ==========
const PORTFOLIO_TEMPLATE: Template = {
  id: "template-portfolio",
  name: "Portfolio",
  description: "Portfolio website with project gallery and contact form",
  category: "portfolio",
  thumbnail: createPlaceholderThumbnail(),
  tags: ["portfolio", "creative", "gallery"],
  isSystem: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  data: {
    components: {
      "root-portfolio": {
        id: "root-portfolio",
        type: "container",
        props: {},
        styles: {
          display: { base: "block" },
          width: { base: "100%" },
        },
        parent: null,
        children: ["header-p", "gallery-p", "contact-p", "footer-p"],
        metadata: { isVisible: true, isLocked: false, name: "Root" },
      },
      "header-p": {
        id: "header-p",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "column" },
          alignItems: { base: "center" },
          padding: { base: "60px 40px" },
          backgroundColor: { base: "#2c3e50" },
          color: { base: "#ffffff" },
          textAlign: { base: "center" },
        },
        parent: "root-portfolio",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Header" },
      },
      "gallery-p": {
        id: "gallery-p",
        type: "grid",
        props: {},
        styles: {
          display: { base: "grid" },
          gridTemplateColumns: { base: "1fr 1fr 1fr" },
          gap: { base: "20px" },
          padding: { base: "40px" },
        },
        parent: "root-portfolio",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Gallery" },
      },
      "contact-p": {
        id: "contact-p",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "column" },
          alignItems: { base: "center" },
          padding: { base: "60px 40px" },
          backgroundColor: { base: "#f8f9fa" },
        },
        parent: "root-portfolio",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Contact" },
      },
      "footer-p": {
        id: "footer-p",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          justifyContent: { base: "center" },
          padding: { base: "30px" },
          backgroundColor: { base: "#2c3e50" },
          color: { base: "#ffffff" },
        },
        parent: "root-portfolio",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Footer" },
      },
    },
    rootId: "root-portfolio",
    version: "1.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

// ========== E-COMMERCE GRID ==========
const ECOMMERCE_TEMPLATE: Template = {
  id: "template-ecommerce",
  name: "E-commerce Grid",
  description: "Product grid layout with side filters and product cards",
  category: "ecommerce",
  thumbnail: createPlaceholderThumbnail(),
  tags: ["ecommerce", "shop", "products"],
  isSystem: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  data: {
    components: {
      "root-ecommerce": {
        id: "root-ecommerce",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "row" },
          width: { base: "100%" },
        },
        parent: null,
        children: ["filters-e", "products-grid-e"],
        metadata: { isVisible: true, isLocked: false, name: "Root" },
      },
      "filters-e": {
        id: "filters-e",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "column" },
          width: { base: "250px" },
          padding: { base: "20px" },
          backgroundColor: { base: "#f8f9fa" },
          borderRight: { base: "1px solid #e0e0e0" },
        },
        parent: "root-ecommerce",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Filters" },
      },
      "products-grid-e": {
        id: "products-grid-e",
        type: "grid",
        props: {},
        styles: {
          display: { base: "grid" },
          gridTemplateColumns: { base: "1fr 1fr 1fr" },
          gap: { base: "20px" },
          padding: { base: "40px" },
          flex: { base: "1" },
        },
        parent: "root-ecommerce",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Products Grid" },
      },
    },
    rootId: "root-ecommerce",
    version: "1.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

// ========== LOGIN/AUTH ==========
const AUTH_TEMPLATE: Template = {
  id: "template-auth",
  name: "Login/Auth Form",
  description: "Centered authentication form with email and password inputs",
  category: "auth",
  thumbnail: createPlaceholderThumbnail(),
  tags: ["auth", "login", "form"],
  isSystem: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  data: {
    components: {
      "root-auth": {
        id: "root-auth",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          justifyContent: { base: "center" },
          alignItems: { base: "center" },
          width: { base: "100%" },
          minHeight: { base: "100vh" },
          backgroundColor: { base: "#f8f9fa" },
        },
        parent: null,
        children: ["form-container-a"],
        metadata: { isVisible: true, isLocked: false, name: "Root" },
      },
      "form-container-a": {
        id: "form-container-a",
        type: "box",
        props: {},
        styles: {
          padding: { base: "40px" },
          backgroundColor: { base: "#ffffff" },
          borderRadius: { base: "8px" },
          boxShadow: { base: "0 2px 8px rgba(0,0,0,0.1)" },
          width: { base: "360px" },
        },
        parent: "root-auth",
        children: ["title-a", "form-a"],
        metadata: { isVisible: true, isLocked: false, name: "Form Container" },
      },
      "title-a": {
        id: "title-a",
        type: "text",
        props: { text: "Sign In" },
        styles: {
          fontSize: { base: "24px" },
          fontWeight: { base: "700" },
          marginBottom: { base: "30px" },
          textAlign: { base: "center" },
          color: { base: "#000000" },
        },
        parent: "form-container-a",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Title" },
      },
      "form-a": {
        id: "form-a",
        type: "flex",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "column" },
          gap: { base: "20px" },
        },
        parent: "form-container-a",
        children: ["email-field-a", "password-field-a", "submit-button-a"],
        metadata: { isVisible: true, isLocked: false, name: "Form" },
      },
      "email-field-a": {
        id: "email-field-a",
        type: "box",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "column" },
          gap: { base: "8px" },
        },
        parent: "form-a",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Email Field" },
      },
      "password-field-a": {
        id: "password-field-a",
        type: "box",
        props: {},
        styles: {
          display: { base: "flex" },
          flexDirection: { base: "column" },
          gap: { base: "8px" },
        },
        parent: "form-a",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Password Field" },
      },
      "submit-button-a": {
        id: "submit-button-a",
        type: "button",
        props: { text: "Sign In", type: "submit" },
        styles: {
          padding: { base: "12px" },
          backgroundColor: { base: "#007bff" },
          color: { base: "#ffffff" },
          borderRadius: { base: "6px" },
          fontSize: { base: "16px" },
          fontWeight: { base: "600" },
          cursor: { base: "pointer" },
        },
        parent: "form-a",
        children: [],
        metadata: { isVisible: true, isLocked: false, name: "Submit Button" },
      },
    },
    rootId: "root-auth",
    version: "1.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

/**
 * Array de todas las plantillas predefinidas
 */
export const PREDEFINED_TEMPLATES: Template[] = [
  LANDING_PAGE_TEMPLATE,
  ADMIN_DASHBOARD_TEMPLATE,
  PORTFOLIO_TEMPLATE,
  ECOMMERCE_TEMPLATE,
  AUTH_TEMPLATE,
];

/**
 * Obtiene todas las plantillas predefinidas
 */
export function getPredefinedTemplates(): Template[] {
  return PREDEFINED_TEMPLATES.map((t) => ({ ...t })); // Return copies
}

/**
 * Obtiene una plantilla predefinida por ID
 */
export function getPredefinedTemplate(id: string): Template | undefined {
  return PREDEFINED_TEMPLATES.find((t) => t.id === id);
}

/**
 * Obtiene plantillas predefinidas por categoría
 */
export function getPredefinedTemplatesByCategory(category: string): Template[] {
  return PREDEFINED_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Busca plantillas por nombre o tags
 */
export function searchPredefinedTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();

  return PREDEFINED_TEMPLATES.filter((t) => {
    const matchName = t.name.toLowerCase().includes(lowerQuery);
    const matchDesc = t.description.toLowerCase().includes(lowerQuery);
    const matchTag = t.tags.some((tag) =>
      tag.toLowerCase().includes(lowerQuery),
    );

    return matchName || matchDesc || matchTag;
  });
}
