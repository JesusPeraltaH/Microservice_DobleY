// scripts/initAtlasDB.ts
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config({ path: ".env.local" });

async function initDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Please set MONGODB_URI in your environment variables");
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Conexión establecida con MongoDB Atlas");

    const db = client.db("microstore");

    const collections = await db.listCollections().toArray();
    console.log("📋 Colecciones existentes:", collections.map(c => c.name));

    // Colecciones necesarias para el microservicio
    const requiredCollections = [
      'users',
      'products', 
      'orders',
      'sales',
      'support_tickets',
      'categories',
      'customers',
      'payments'
    ];

    for (const collectionName of requiredCollections) {
      if (!collections.find(c => c.name === collectionName)) {
        await db.createCollection(collectionName);
        console.log(`📦 Colección '${collectionName}' creada`);
      } else {
        console.log(`✅ Colección '${collectionName}' ya existe`);
      }
    }

    // Insertar datos iniciales en products si está vacía
    const productsCollection = db.collection("products");
    const productCount = await productsCollection.countDocuments();
    
    if (productCount === 0) {
      await productsCollection.insertMany([
        {
          name: "Laptop Gaming",
          description: "Laptop para gaming de alto rendimiento",
          price: 1299.99,
          category: "electronics",
          stock: 15,
          sku: "ELEC-001",
          image: "/images/laptop.jpg",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Smartphone Flagship",
          description: "Último modelo de smartphone",
          price: 899.99,
          category: "electronics",
          stock: 30,
          sku: "ELEC-002",
          image: "/images/phone.jpg",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Camiseta Premium",
          description: "Camiseta de algodón 100%",
          price: 29.99,
          category: "clothing",
          stock: 100,
          sku: "CLOTH-001",
          image: "/images/shirt.jpg",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log("📝 Productos de ejemplo insertados");
    }

    // Insertar datos iniciales en users si está vacía
    const usersCollection = db.collection("users");
    const userCount = await usersCollection.countDocuments();
    
    if (userCount === 0) {
      await usersCollection.insertMany([
        {
          name: "Admin User",
          email: "admin@microstore.com",
          password: "$2b$10$examplehashedpassword", // Contraseña hasheada
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "John Doe",
          email: "john@example.com",
          password: "$2b$10$examplehashedpassword",
          role: "customer",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      console.log("👥 Usuarios de ejemplo insertados");
    }

    // Insertar categorías iniciales
    const categoriesCollection = db.collection("categories");
    const categoryCount = await categoriesCollection.countDocuments();
    
    if (categoryCount === 0) {
      await categoriesCollection.insertMany([
        {
          name: "Electrónicos",
          slug: "electronics",
          description: "Dispositivos electrónicos y tecnología",
          createdAt: new Date()
        },
        {
          name: "Ropa",
          slug: "clothing", 
          description: "Prendas de vestir y accesorios",
          createdAt: new Date()
        },
        {
          name: "Hogar",
          slug: "home",
          description: "Productos para el hogar",
          createdAt: new Date()
        }
      ]);
      console.log("🏷️ Categorías de ejemplo insertadas");
    }

    console.log("🎉 Base de datos inicializada exitosamente!");
    console.log("📊 Resumen de colecciones:");
    
    const finalCollections = await db.listCollections().toArray();
    finalCollections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });

  } catch (err) {
    console.error("❌ Error inicializando la base de datos:", err);
  } finally {
    await client.close();
  }
}

initDatabase();