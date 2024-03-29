import { asyncError } from "../middlewares/error.js";
import {Product} from "../models/product.js"
import ErrorHandler from "../utils/error.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";
import {Category} from "../models/category.js"


export const getAllProducts = asyncError(async(req, res, next)=>{
    // Search & Category Query;

    const {keyword, category} = req.query;

    const products = await Product.find({
        name: {
            $regex: keyword? keyword : "", 
            $options:"i",
        },
        category: category?category:undefined,
    })

    res.status(200).json({
        success: true,
        products,
    });
});

export const getAdminProducts = asyncError(async(req, res, next)=>{
    // Search & Category Query;
    const products = await Product.find({}).populate("category");

    const outofStock = products.filter((i)=>i.stock === 0);

    res.status(200).json({
        success: true,
        products,
        outofStock: outofStock.length,
        inStock: products.length - outofStock.length,
    });
});

export const getProductDetails = asyncError(async(req, res, next)=>{
    // Search & Category Query;
    const product = await Product.findById(req.params.id).populate("category");

    if(!product)
    return next(new ErrorHandler("Product Not Found", 404));

    res.status(200).json({
        success: true,
        product,
    });
});

export const createProduct = asyncError(async(req, res, next)=>{

    const {name, description, category, price, stock} = req.body;

    if(!req.file)
    return next(new ErrorHandler("Please add image", 400));

    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    const image = {
        public_id:myCloud.public_id,
        url:myCloud.secure_url,
    };

    await Product.create({
        name, 
        description, 
        category, 
        price, 
        stock,
        images: [image],
    });

    res.status(200).json({
        success: true,
        message: "Product Created Succesfully",
    });
});

export const updateProduct = asyncError(async(req, res, next)=>{

    const {name, description, category, price, stock} = req.body;
    const product = await Product.findById(req.params.id);

    if(!product)
    return next(new ErrorHandler("Product Not Found", 404));
    if(name) product.name = name;
    if(description) product.description = description;
    if(price) product.price = price;
    if(stock) product.stock = stock;
    if(category) product.category = category;

    await product.save();

    res.status(200).json({
        success: true,
        message: "Product Updated Succesfully",
    });
});

export const deleteProduct = asyncError(async(req, res, next)=>{

    const product = await Product.findById(req.params.id);

    if(!product) return next(new ErrorHandler("Product Not Found", 404));
    
    for(let i=0; i<product.images.length; i++){
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Product Deleted Succesfully",
    });
});

export const addProductImages = asyncError(async(req, res, next)=>{
    const product = await Product.findById(req.params.id);

    if(!product)
    return next(new ErrorHandler("Product Not Found", 404));

    if(!req.file)
    return next(new ErrorHandler("Please add image", 400));

    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    const image = {
        public_id:myCloud.public_id,
        url:myCloud.secure_url,
    };

    product.images.push(image);
    await product.save();

    res.status(200).json({
        success: true,
        message: "Image added Succesfully",
    });
});

export const deleteProductImages = asyncError(async(req, res, next)=>{
    const product = await Product.findById(req.params.id);

    if(!product)
    return next(new ErrorHandler("Product Not Found", 404));

    const id = req.query.id
    if(!id)
    return next(new ErrorHandler("Please Enter Image Id", 400));
    let isExist = -1;
    product.images.forEach((item, index)=>{
        if(item._id.toString() === id.toString())
        isExist = index;
    });
    if(isExist < 0) return next(new ErrorHandler("Image dosn't exist", 400));

    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    product.images.splice(isExist, 1);

    await product.save();

    res.status(200).json({
        success: true,
        message: "Image Deleted Succesfully",
    });
});

export const addCategory = asyncError(async(req, res, next)=>{

    await Category.create(req.body);

    res.status(201).json({
        success: true,
        message: "Category Added Succesfully",
    });
});

export const getAllCategories = asyncError(async(req, res, next)=>{

    const categories = await Category.find({});

    res.status(200).json({
        success: true,
        categories,
    });
});

export const deleteCategory = asyncError(async(req, res, next)=>{

    const category = await Category.findById(req.params.id)

    if(!category)
        return next(new ErrorHandler("Category Not Found", 404));

    const products = await Product.find({category:category._id})

    for(let i = 0; i < products.length; i++){
       const product = products[i]; 
       product.category=undefined;
       await product.save();
    }

    await category.deleteOne();

    res.status(200).json({
        success: true,
        message: "Category deleted Succesfully",
    });
});