import express from "express";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import { addCategory, addProductImages, createProduct, deleteCategory, deleteProduct, deleteProductImages, getAdminProducts, getAllCategories, getAllProducts, getProductDetails, updateProduct } from "../controllers/product.js";

const router = express.Router();

router.get("/all", getAllProducts)
router.get("/admin", isAuthenticated, isAdmin, getAdminProducts)
router.route("/single/:id").get(getProductDetails).put(isAuthenticated, isAdmin, updateProduct).delete(isAuthenticated, isAdmin, deleteProduct)
router.post("/new",isAuthenticated, isAdmin, singleUpload, createProduct)
router.route("/images/:id").post(isAuthenticated, singleUpload, addProductImages).delete(isAuthenticated, isAdmin, deleteProductImages)

router.post("/category",isAuthenticated, addCategory);
router.get("/categories",isAuthenticated, getAllCategories);
router.delete("/category/:id",isAuthenticated, deleteCategory);

export default router;