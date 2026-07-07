# Technical Task: Simple POS System - MERN Stack

## Objective

Build a simple Point of Sale (POS) web application using the MERN stack.

The goal of this task is to evaluate your ability to design a clean full-stack application, structure code properly, handle basic business logic, and deliver a usable interface.

## Recommended Time

Please spend no more than 2 to 3 days on this task.

Focus on correctness, code quality, and a clean user experience rather than building too many features.

## Tech Stack

Use the following stack:

- MongoDB
- Express.js
- React.js
- Node.js

You may use any UI library you are comfortable with, such as Material UI, Bootstrap, Tailwind CSS, or plain CSS.

## Core Requirements

### 1. Authentication

Create a basic login system.

Requirements:

- User can log in with email and password.
- Use JWT-based authentication.
- Protect POS and admin routes from unauthenticated users.
- Seed or create at least one default admin user.

Role handling is optional, but a simple `admin` role is a plus.

### 2. Product Management

Create product CRUD functionality.

Each product should include:

- Product name
- SKU or product code
- Category
- Price
- Available stock quantity
- Active/inactive status

Required actions:

- Add product
- Edit product
- Delete or deactivate product
- View product list
- Search products by name or SKU

### 3. POS Sales Screen

Create a sales screen where a cashier can create an order.

Requirements:

- Search and select products.
- Add products to cart.
- Increase or decrease cart item quantity.
- Remove items from cart.
- Show subtotal.
- Allow discount input.
- Show final total.
- Complete sale.

Validation:

- Do not allow selling more quantity than available stock.
- Do not allow completing an empty sale.
- Product stock should reduce after a successful sale.

### 4. Sales History

Create a sales history page.

Each completed sale should store:

- Sale number or invoice number
- Sold items
- Quantity per item
- Unit price
- Discount
- Total amount
- Sale date and time
- User who created the sale

Required views:

- List all sales.
- View sale details.
- Filter sales by date range.

### 5. Dashboard

Create a simple dashboard showing:

- Total sales amount
- Number of completed sales
- Number of products
- Low-stock products

Low stock can be defined as products with stock quantity less than 5.

## Backend Requirements

Your backend should include:

- REST API using Express.js
- MongoDB models using Mongoose
- Proper request validation
- Proper error handling
- Authentication middleware
- Clear folder structure

Suggested backend structure:

```text
backend/
  src/
    controllers/
    models/
    routes/
    middleware/
    config/
    utils/
```

## Frontend Requirements

Your frontend should include:

- Login page
- Product management page
- POS sales page
- Sales history page
- Dashboard page
- Basic navigation
- Loading and error states where needed

Suggested frontend structure:

```text
frontend/
  src/
    components/
    pages/
    services/
    context/
    utils/
```

## Business Rules

Please make sure the following rules are handled correctly:

- Stock must decrease only after a successful sale.
- A sale should not be completed if any product does not have enough stock.
- Discount should not make the final total negative.
- Inactive products should not be available for sale.
- Sale records should preserve the product name and price at the time of sale, even if the product is later edited.

## API Expectations

At minimum, create APIs for:

- Login
- Get current user
- Product CRUD
- Create sale
- Get sales list
- Get sale details
- Dashboard summary

Use clean and predictable endpoint names, for example:

```text
POST   /api/auth/login
GET    /api/auth/me
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/sales
GET    /api/sales
GET    /api/sales/:id
GET    /api/dashboard/summary
```

## Optional Bonus Features

These are not mandatory, but they can improve your submission:

- Print-friendly invoice view
- Product category management
- Barcode/SKU quick add
- Pagination in product and sales lists
- Role-based access control
- Unit tests or API tests
- Docker setup
- Responsive mobile/tablet layout

## Submission Instructions

Please submit:

- GitHub repository link
- Setup instructions in `README.md`
- Environment variable examples in `.env.example`
- Default login credentials
- Any assumptions or limitations

The project should run locally with clear instructions.

Example:

```text
npm install
npm run dev
```

If frontend and backend run separately, explain both commands clearly.

## Evaluation Criteria

Your submission will be reviewed based on:

- Correct implementation of the required features
- Code structure and readability
- API design and backend validation
- React component structure and state management
- Handling of POS business rules
- User experience and basic UI polish
- Error handling
- Git commit quality
- README clarity

## Notes

Please do not use a ready-made POS template or copy an existing full project.

You may use open-source libraries, but the application logic and structure should be your own work.

The final result does not need to be production-ready, but it should be stable enough to demo the main POS workflow from login to product creation to completing a sale.
