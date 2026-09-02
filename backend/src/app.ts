import express from "express";
import tableRoutes from "./routes/table.routes";
import cors from "cors";
import menuCategoryRoutes from "./routes/menuCategory.route";
import menuItemRoutes from "./routes/menuItem.route";
import orderRoutes from "./routes/order.routes";
import orderItemRoutes from "./routes/orderItem.routes";
import authRouter from "./routes/authRouter";
import cookieParser from "cookie-parser";
import paymentRoutes from "./routes/payment.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/tables", tableRoutes);
app.use("/menu-categories", menuCategoryRoutes);
app.use("/menu-items", menuItemRoutes);
app.use("/orders", orderRoutes);
app.use("/order-items", orderItemRoutes);
app.use("/auth", authRouter);
app.use("/payments", paymentRoutes);

export default app;
