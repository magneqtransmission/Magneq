# MagneQ ERP System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [User Roles & Authentication](#user-roles--authentication)
5. [Backend API Documentation](#backend-api-documentation)
6. [Frontend Application Features](#frontend-application-features)
7. [Database Schema](#database-schema)
8. [Key Features & Modules](#key-features--modules)
9. [API Endpoints](#api-endpoints)
10. [Deployment & Setup](#deployment--setup)
11. [Mobile Application](#mobile-application)

---

## Project Overview

**MagneQ** is a comprehensive Enterprise Resource Planning (ERP) system designed for manufacturing companies specializing in geared motors and helical gearboxes. The system provides end-to-end management of business operations including sales, production, inventory, quality control, and customer management.

### Key Business Areas Covered:
- **Sales Management**: Order processing, customer management, invoicing
- **Production Management**: Production planning, tracking, and monitoring
- **Inventory Management**: Raw materials and finished goods tracking
- **Quality Control**: Issue tracking and quality assurance
- **Purchase Management**: Vendor management and purchase orders
- **Financial Management**: Ledger, payments, and invoicing

---

## System Architecture

The MagneQ system follows a modern three-tier architecture:

### 1. **Backend (MagneqBackend)**
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker support

### 2. **Frontend (MagneqFrontend)**
- **Framework**: React 19.1.0 with Vite
- **State Management**: Redux Toolkit
- **UI Library**: Custom components with Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM

### 3. **Mobile App (MagneqApp)**
- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit
- **Platform Support**: iOS and Android

---

## Technology Stack

### Backend Technologies
```json
{
  "runtime": "Node.js v22.4.1",
  "framework": "Express.js v5.1.0",
  "database": "MongoDB with Mongoose v8.16.0",
  "authentication": "JWT with bcrypt",
  "documentation": "Swagger UI Express",
  "utilities": ["date-fns", "xlsx", "puppeteer"]
}
```

### Frontend Technologies
```json
{
  "framework": "React v19.1.0",
  "buildTool": "Vite v6.3.5",
  "styling": "Tailwind CSS v4.1.11",
  "stateManagement": "Redux Toolkit v2.8.2",
  "dataFetching": "TanStack Query v5.81.5",
  "routing": "React Router DOM v7.6.2",
  "charts": "ApexCharts v4.7.0"
}
```

### Mobile Technologies
```json
{
  "framework": "React Native",
  "navigation": "React Navigation",
  "stateManagement": "Redux Toolkit",
  "platforms": ["iOS", "Android"]
}
```

---

## User Roles & Authentication

### User Roles

#### 1. **ADMIN**
- **Access**: Full system access
- **Features**: Dashboard, Sales, Production, Stores, Purchase, Quality
- **Permissions**: Complete CRUD operations across all modules

#### 2. **DEVELOPER**
- **Access**: System configuration and management
- **Features**: 
  - Manage Finished Goods
  - Manage Raw Materials
  - Manage Vendors/Suppliers
  - Manage Users
  - Manage Customers
- **Permissions**: Master data management

#### 3. **SALES_EXEC**
- **Access**: Sales-focused operations
- **Features**: Create Sales, View Sales, Track Sales, Quality
- **Permissions**: Sales order management and customer interaction

#### 4. **PRODUCTION_EXEC**
- **Access**: Production operations
- **Features**: Production management, Quality control
- **Permissions**: Production planning and monitoring

#### 5. **CUSTOMER**
- **Access**: Customer portal
- **Features**: View orders, Track orders, Quality issues
- **Permissions**: Read-only access to their orders

### Authentication System

#### Login Process
1. **Role Selection**: Users select between "STAFF" or "CUSTOMER"
2. **Credential Validation**: Username/password verification
3. **JWT Token Generation**: Secure token with role-based permissions
4. **Route Permissions**: Dynamic sidebar and route access based on role

#### Security Features
- Password hashing with bcrypt
- JWT token expiration
- Role-based route protection
- API endpoint authentication middleware

---

## Backend API Documentation

### Core Models

#### 1. **User Model**
```javascript
{
  name: String,
  role: String,
  password: String (hashed),
  user_name: String,
  created_at: Date,
  updated_at: Date
}
```

#### 2. **Customer Model**
```javascript
{
  name: String,
  address: String,
  pin_code: String,
  state: String,
  gst_no: String,
  password: String (hashed),
  user_name: String,
  phone: String,
  role: String (default: 'CUSTOMER')
}
```

#### 3. **Raw Materials Model**
```javascript
{
  class_type: String (enum: ["A", "B", "C"]),
  other_specification: Mixed,
  quantity: { processed: Number, rejected: Number },
  min_quantity: Number,
  name: String,
  type: String,
  expiry_date: Date
}
```

#### 4. **Sales Model**
```javascript
{
  order_id: Number (auto-increment),
  finished_goods: [{
    finished_good: ObjectId,
    rate_per_unit: Decimal128,
    quantity: Number,
    invoiced_quantity: Number,
    item_total_price: Decimal128,
    status: String (enum: ["PENDING", "INPROCESS", "PROCESSED"])
  }],
  customer_name: String,
  status: String (enum: ["UN_APPROVED", "INPROCESS", "PROCESSED", "DISPATCHED", "DELIVERED", "CANCELLED"]),
  total_amount: Decimal128,
  delivery_date: Date
}
```

#### 5. **Production Model**
```javascript
{
  pro_id: Number (auto-increment),
  finished_good: ObjectId,
  order_quantity: Number,
  production_quantity: Number,
  produced_quantity: Number,
  customer_name: String,
  status: String (enum: ["UN_PROCESSED", "IN_PROCESSES", "READY", "COMPLETED"])
}
```

#### 6. **Quality Model**
```javascript
{
  finished_good: [ObjectId],
  issue_type: String,
  vendor: String,
  issue: String,
  action_taken: Boolean,
  created_by: String
}
```

### API Routes Structure

```
/api/
├── /user                    # User authentication
├── /ledger                  # Financial ledger
├── /raw_material           # Raw materials management
├── /purchase_order         # Purchase order management
├── /quality                # Quality control
├── /finished_goods         # Finished goods management
├── /sales                  # Sales management
├── /invoice                # Invoice management
├── /delivery               # Delivery management
├── /production             # Production management
├── /dashboard              # Dashboard analytics
├── /manage                 # System management
├── /notification           # Notification system
└── /payment                # Payment processing
```

---

## Frontend Application Features

### 1. **Dashboard**
- **Metrics Display**: Key performance indicators
- **Sales Analytics**: Revenue and order statistics
- **Charts & Graphs**: Visual data representation using ApexCharts
- **Recent Activities**: Latest orders and production updates

### 2. **Sales Management**
- **Order Creation**: Create new sales orders
- **Order Tracking**: Track order status and progress
- **Customer Management**: View and manage customer information
- **Payment Processing**: Handle payments and invoicing

### 3. **Production Management**
- **Production Planning**: Create and manage production orders
- **Daily Production**: Track daily production activities
- **Production Details**: Detailed view of production processes
- **Status Tracking**: Monitor production status

### 4. **Inventory Management**
- **Raw Materials**: Manage raw material inventory
- **Finished Goods**: Track finished product inventory
- **Stock Levels**: Monitor minimum stock levels
- **Add Stock**: Add new inventory items

### 5. **Quality Control**
- **Issue Tracking**: Create and manage quality issues
- **Quality Tickets**: Track quality-related tickets
- **Vendor Quality**: Monitor vendor quality issues
- **Action Tracking**: Track corrective actions

### 6. **Purchase Management**
- **Purchase Orders**: Create and manage purchase orders
- **Vendor Management**: Manage supplier relationships
- **Vendor Tracking**: Track vendor performance
- **Short Quantity**: Handle quantity discrepancies

### 7. **Financial Management**
- **Ledger**: Financial transaction tracking
- **Invoice Management**: Create and manage invoices
- **Payment Processing**: Handle payment collections
- **Financial Reports**: Generate financial reports

### 8. **Developer Panel**
- **User Management**: Create and manage system users
- **Customer Management**: Manage customer database
- **Supplier Management**: Manage vendor database
- **Product Management**: Manage finished goods and raw materials

---

## Database Schema

### Entity Relationships

```
Users (1) ←→ (M) Sales Orders
Users (1) ←→ (M) Production Orders
Users (1) ←→ (M) Quality Issues

Customers (1) ←→ (M) Sales Orders
Customers (1) ←→ (M) Invoices

Raw Materials (1) ←→ (M) Purchase Orders
Raw Materials (1) ←→ (M) Finished Goods (via BOM)

Finished Goods (1) ←→ (M) Sales Orders
Finished Goods (1) ←→ (M) Production Orders
Finished Goods (1) ←→ (M) Quality Issues

Sales Orders (1) ←→ (M) Invoices
Sales Orders (1) ←→ (M) Deliveries
```

### Key Collections

1. **Users**: System users and authentication
2. **Customers**: Customer information and credentials
3. **RawMaterials**: Raw material inventory
4. **FinishedGoods**: Finished product specifications
5. **Sales**: Sales orders and transactions
6. **Production**: Production orders and tracking
7. **Purchase**: Purchase orders and vendor management
8. **Quality**: Quality issues and tracking
9. **Invoice**: Invoice management
10. **Delivery**: Delivery tracking
11. **Ledger**: Financial transactions
12. **RoutePermission**: Role-based access control

---

## Key Features & Modules

### 1. **Multi-Role Access Control**
- Dynamic sidebar based on user role
- Route-level permissions
- Feature-specific access control

### 2. **Real-time Dashboard**
- Live metrics and KPIs
- Interactive charts and graphs
- Real-time notifications

### 3. **Order Management System**
- Complete order lifecycle management
- Status tracking and updates
- Customer communication

### 4. **Production Planning**
- Bill of Materials (BOM) management
- Production scheduling
- Resource allocation

### 5. **Inventory Control**
- Real-time stock levels
- Minimum quantity alerts
- Expiry date tracking

### 6. **Quality Assurance**
- Issue tracking system
- Vendor quality monitoring
- Corrective action management

### 7. **Financial Management**
- Automated invoicing
- Payment tracking
- Financial reporting

### 8. **Mobile Support**
- Cross-platform mobile app
- Offline capability
- Push notifications

---

## API Endpoints

### Authentication Endpoints
```
POST /api/user/register     # User registration
POST /api/user/login        # User login
PUT  /api/user/password     # Password update
```

### Sales Endpoints
```
GET    /api/sales           # Get all sales orders
POST   /api/sales           # Create sales order
GET    /api/sales/:id       # Get specific sales order
PUT    /api/sales/:id       # Update sales order
DELETE /api/sales/:id       # Delete sales order
```

### Production Endpoints
```
GET    /api/production      # Get all production orders
POST   /api/production      # Create production order
GET    /api/production/:id  # Get specific production order
PUT    /api/production/:id  # Update production order
```

### Inventory Endpoints
```
GET    /api/raw_material    # Get raw materials
POST   /api/raw_material    # Add raw material
GET    /api/finished_goods  # Get finished goods
POST   /api/finished_goods  # Add finished good
```

### Quality Endpoints
```
GET    /api/quality         # Get quality issues
POST   /api/quality         # Create quality ticket
PUT    /api/quality/:id     # Update quality issue
```

---

## Deployment & Setup

### Backend Setup
```bash
# Navigate to backend directory
cd MagneqBackend

# Install dependencies
npm install

# Configure environment
cp sample.env .env

# Start Docker containers
docker compose up

# Seed database
npm run seed

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd MagneqFrontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Mobile App Setup
```bash
# Navigate to mobile app directory
cd MagneqApp

# Install dependencies
npm install

# iOS setup
cd ios && pod install

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## Mobile Application

### Features
- **Cross-platform**: iOS and Android support
- **Offline Support**: Works without internet connection
- **Push Notifications**: Real-time updates
- **Role-based UI**: Dynamic interface based on user role

### Navigation Structure
- **Drawer Navigation**: Side menu for easy access
- **Stack Navigation**: Hierarchical screen navigation
- **Tab Navigation**: Quick access to main features

### Key Screens
1. **Login**: Authentication and role selection
2. **Dashboard**: Overview of key metrics
3. **Sales**: Order management and tracking
4. **Production**: Production planning and monitoring
5. **Stores**: Inventory management
6. **Quality**: Issue tracking and management
7. **Purchase**: Purchase order management

---

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Token expiration handling

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

### API Security
- Rate limiting
- Request validation
- Error handling
- Logging and monitoring

---

## Performance Optimizations

### Frontend Optimizations
- Code splitting with React.lazy
- Memoization with React.memo
- Virtual scrolling for large lists
- Image optimization
- Bundle size optimization

### Backend Optimizations
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling
- API response compression

### Mobile Optimizations
- Image caching
- Offline data storage
- Lazy loading
- Memory management
- Battery optimization

---

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: Machine learning-based insights
2. **IoT Integration**: Sensor data integration
3. **Blockchain**: Supply chain transparency
4. **AI Chatbot**: Customer support automation
5. **Advanced Reporting**: Custom report builder

### Scalability Improvements
1. **Microservices**: Service decomposition
2. **Load Balancing**: Horizontal scaling
3. **Caching Layer**: Redis integration
4. **CDN**: Content delivery optimization
5. **Database Sharding**: Data partitioning

---

## Support & Maintenance

### Documentation
- API documentation with Swagger
- Code documentation with JSDoc
- User manuals and guides
- Video tutorials

### Monitoring
- Application performance monitoring
- Error tracking and logging
- User analytics
- System health checks

### Maintenance
- Regular security updates
- Performance optimizations
- Bug fixes and patches
- Feature enhancements

---

## Conclusion

The MagneQ ERP system provides a comprehensive solution for manufacturing companies, offering end-to-end management of business operations. With its modern architecture, role-based access control, and multi-platform support, it enables efficient management of sales, production, inventory, and quality control processes.

The system's modular design allows for easy customization and scaling, making it suitable for businesses of various sizes. The combination of web and mobile applications ensures accessibility across different devices and user preferences.

---

*This documentation is maintained and updated regularly to reflect the current state of the MagneQ ERP system.*
