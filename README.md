# Bahari Nusantara - Restaurant Order Management System

Bahari Nusantara is a restaurant order management system designed to support restaurant staff in managing customer orders, menus, tables, payments, and order history.

The project consists of a backend API and a mobile application for cashier operations.

## Features

### Authentication

- User registration
- User login
- JWT authentication
- HttpOnly Cookie
- Authentication middleware
- Protected API routes

### Order Management

- Create new order
- Dine In order
- Take Away order
- Table selection
- Menu selection
- Quantity management
- Order notes
- Order status management
- Order detail
- Order history

### Menu Management

- Menu listing
- Menu category
- Menu price
- Menu description
- Soft delete menu item

### Table Management

- Table listing
- Table number
- Table capacity
- Table status
- Dine In table selection

### Payment

- Cash payment
- QRIS payment
- Card payment
- Bank transfer
- Payment status
- Payment method
- Payment confirmation

### Revenue

- Total paid orders
- Total revenue calculation
- Revenue summary on order activity

### Kitchen & Invoice

- Print kitchen order
- Print customer invoice
- Kitchen notes
- Order item details
- Payment information

---

## Technology Stack

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod
- Axios

### Mobile Application

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Print
- Axios

---

### API

The mobile application communicates with the backend through REST API endpoints.

Main API modules include:

Authentication
Orders
Menu
Tables
Payments

The backend handles authentication, validation, business logic, database operations, and order processing.

---

### Database

The backend uses PostgreSQL as the relational database and Prisma ORM for database access.

The database contains entities related to:

Users
Menus
Menu Categories
Tables
Orders
Order Items
Payments

---

### Development

This project was developed as a restaurant order management application with a focus on:
REST API development
Authentication
Database management
Order processing
Payment handling
React Native mobile development
TypeScript
API integration

---

### Author

Ahya Mahfuzi
Restaurant Order Management System

---
