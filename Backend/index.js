express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('./models/User');
const VendingMachine = require('./models/VendingMachine');
const Order = require('./models/Order');
const QRCode = require('qrcode');
const cartModel = require('./models/Cart')
const { urlencoded } = require('express');
const cors = require('cors');
require('dotenv').config();


app.use(cors());

app.options('*', cors());

app.set('view engine', 'ejs');

mongoose.connect(`${process.env.MONGODB}`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

app.get('/',function(req,res){
    res.send('Hello');
});


app.use(express.json()); 
app.use(urlencoded());

app.get('/registerr',function(req,res){
    res.render('index');
});

app.post('/register', async function (req, res) {
    try {
        const { username, email, password } = req.body;

        
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword,
            type: 'Customer'
        });
        const newCart = await cartModel.create({
            user: newUser._id,
            items: [] 
        });

        res.status(201).json({ message: "User registered successfully.", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});



app.get('/profile',function(){
    res.render('profile');
});

app.get('/loginn',function(req,res){
      res.render('login');
});

app.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;

        console.log(req.body);
        

        console.log(email);
        console.log(password);
        

        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const payload = {
            userId: user._id,
            email: user.email,
            username: user.username,
            type: user.type,
        };
    
        
        if (user.vendingMachine) {
            payload.vendingMachine = user.vendingMachine;
        }

        
        const token = jwt.sign(
            payload, 
            Buffer.from('defaultkey', 'base64'), 
            { expiresIn: '1h' } 
        );

        res.status(200).json({
            message: "Login successful.",
            token: token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});



app.get('/protected', async function (req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
        
        const user = await jwt.verify(token, Buffer.from('defaultkey', 'base64'));

        req.user = user; 
        res.status(200).json({ message: "Protected route accessed.", user });
    } catch (err) {
        return res.status(403).json({ message: "Invalid token." });
    }
});

app.post('/get-nearest-vending-machines', async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Latitude and longitude are required." });
        }

        
        const vendingMachines = await VendingMachine.find();

        
        const getDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; 
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLon = (lon2 - lon1) * (Math.PI / 180);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) *
                    Math.cos(lat2 * (Math.PI / 180)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; 
        };

        
        const vendingMachinesWithDistance = vendingMachines.map(vendingMachine => {
            const { latitude: lat2, longitude: lon2 } = vendingMachine.location;
            const distance = getDistance(latitude, longitude, lat2, lon2);
            return { ...vendingMachine.toObject(), distance }; 
        });

        
        vendingMachinesWithDistance.sort((a, b) => a.distance - b.distance);

        
        const nearestVendingMachines = vendingMachinesWithDistance.slice(0, 3);

        res.status(200).json(nearestVendingMachines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});


app.put('/update-username', async function (req, res) {
    const { email, username } = req.body;  

    if (!email || !username) {
        return res.status(400).json({ message: "Email and new username are required." });
    }

    try {
        
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        
        user.username = username;
        await user.save();

        res.status(200).json({ message: "Username updated successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
});


app.put('/update-password', async function (req, res) {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "Email, old password, and new password are required." });
    }

    try {
        
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(400).json({ message: "Old password is incorrect." });
        }

        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
});

app.get('/vending-machines/:id', async (req, res) => {
    try {
      const vendingMachine = await VendingMachine.findById(req.params.id);
      if (!vendingMachine) {
        return res.status(404).json({ message: "Vending machine not found." });
      }
      res.json(vendingMachine);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  });

  
  app.get('/get-cart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        
        const cart = await cartModel.findOne({ user: userId }).populate('items.itemName'); 
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        
        res.status(200).json(cart); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

app.put('/update-cart', async (req, res) => {
    try {
        const { cart } = req.body; 
        const { user } = cart;  

        
        if (!cart || !user) {
            return res.status(400).json({ message: "Cart and userId are required." });
        }

        
        const curuser = await userModel.findById(user);
        if (!curuser) {
            return res.status(404).json({ message: "User not found." });
        }

        
        let existingCart = await cartModel.findOne({ user: user });

        
        if (!existingCart) {
            existingCart = new cartModel({
                user: user,
                items: [],
            });
        }

        
        existingCart.items = cart.items;
        if (cart.vendingMachine) {
            existingCart.vendingMachine = cart.vendingMachine;
        } else {
            
            existingCart.vendingMachine = undefined;
        }

        
        await existingCart.save();

        
        res.status(200).json({ message: "Cart updated successfully.", cart: existingCart });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

app.get('/cart/:userId', async (req, res) => {
    try {
      const cart = await cartModel.findOne({ user: req.params.userId }).populate('items');
      
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/create-order', async (req, res) => {
    const { userId, vendingMachineId, items, total } = req.body;

    try {
        
        const orderDetails = {
            userId,
            vendingMachineId,
            items,
            total,
            status: 'Pending'
        };

        
        const newOrder = new Order({
            user: userId,
            vendingMachine: vendingMachineId,
            items,
            total,
            status: 'Pending'
        });

        
        await newOrder.save();

        
        orderDetails.orderId = newOrder._id.toString(); 
        const qrCodeUri = await QRCode.toDataURL(JSON.stringify(orderDetails));

        
        newOrder.qrCodeUri = qrCodeUri;
        
        
        await newOrder.save();

        const vendingMachine = await VendingMachine.findById(vendingMachineId);

        
        for (const orderedItem of items) {
            const vendingMachineItem = vendingMachine.stock.find(item => item.itemName === orderedItem.itemName);
            
            if (vendingMachineItem) {
                
                vendingMachineItem.stock -= orderedItem.quantity;

                
                if (vendingMachineItem.stock < 0) {
                    return res.status(400).json({ message: `Not enough stock for item: ${orderedItem.itemName}` });
                }
            }
        }

        
        await vendingMachine.save();

        
        const userCart = await cartModel.findOne({ user: userId });
        if (userCart) {
            userCart.items = []; 
            await userCart.save(); 
        }

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order', error });
    }
});


app.get('/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId)
            .populate('user') 
            .populate('vendingMachine'); 

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order', error });
    }
});

app.get('/userorders/:userId', async (req, res) => {
    try {
      
      const { userId } = req.params;
      
  
      
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 }) 
        .populate('vendingMachine', 'name') 
        .exec();
  
      res.json({ orders });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving orders', error });
    }
  });


app.get('/vending-machines/:id', async (req, res) => {
  try {
    const vendingMachine = await VendingMachine.findById(req.params.id);
    if (!vendingMachine) {
      return res.status(404).json({ message: 'Vending Machine not found' });
    }
    res.json(vendingMachine);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});


app.get('/order-stats/:vendingMachineId', async (req, res) => {
    try {
      const vendingMachineId = req.params.vendingMachineId;
  
      
      const orders = await Order.find({ vendingMachine: vendingMachineId });
  
      
      let dailyRevenue = {};
      let itemsSold = {};
  
      orders.forEach(order => {
        const orderDate = order.createdAt.toISOString().split('T')[0]; 
        if (!dailyRevenue[orderDate]) {
          dailyRevenue[orderDate] = 0;
        }
        dailyRevenue[orderDate] += order.total;
  
        
        order.items.forEach(item => {
          if (itemsSold[item.itemName]) {
            itemsSold[item.itemName] += item.quantity;
          } else {
            itemsSold[item.itemName] = item.quantity;
          }
        });
      });
  
      
      res.json({
        dailyRevenue,
        itemsSold,
        ordersCount: orders.length,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server Error' });
    }
  });

  app.put('/update-stock/:vendingMachineId', async (req, res) => {
    try {
      const { stock } = req.body;
      const vendingMachineId = req.params.vendingMachineId;
  
      
      let existingStock = await VendingMachine.findById(vendingMachineId);
  
      
      const existingItemsMap = existingStock.stock.reduce((map, item) => {
        map[item.itemName] = item;
        return map;
      }, {});
  
      
      const updatedItemsMap = stock.reduce((map, newItem) => {
        map[newItem.itemName] = newItem;
        return map;
      }, {});
  
      
      existingStock.stock = existingStock.stock.filter(item => updatedItemsMap[item.itemName]);
  
      
      stock.forEach((newItem) => {
        const existingItem = existingItemsMap[newItem.itemName];
        if (existingItem) {
          
          existingItem.stock = newItem.stock;
          existingItem.price = newItem.price;
        } else {
          
          existingStock.stock.push(newItem);
        }
      });

      existingStock.stock = existingStock.stock.filter(item => item.stock > 0);
  
      
      await existingStock.save();
  
      res.status(200).json({ message: "Stock updated successfully.", cart: existingStock });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error. Please try again later." });
    }
  });
  
  app.get('/orders/vending-machine/:vendingMachineId', async (req, res) => {
    const { vendingMachineId } = req.params;
  
    try {
      
      const orders = await Order.find({ vendingMachine: vendingMachineId })
        .populate('user') 
        .populate('vendingMachine');
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this vending machine' });
      }
  
      res.status(200).json({ orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Error fetching orders', error });
    }
  });
  
  app.post('/add-stock', async (req, res) => {
    try {
      const { itemName, quantity, price, vendingMachineId } = req.body;
  
      
      const vendingMachine = await VendingMachine.findById(vendingMachineId);
      if (!vendingMachine) {
        return res.status(404).json({ error: "Vending machine not found" });
      }
  
      
      const productIndex = vendingMachine.stock.findIndex(item => item.itemName === itemName);
  
      if (productIndex !== -1) {
        
        vendingMachine.stock[productIndex].stock += Number(quantity);
        vendingMachine.stock[productIndex].price = price; 
      } else {
        
        vendingMachine.stock.push({
          itemName,
          stock: quantity,
          price, 
        });
      }
  
      
      await vendingMachine.save();
  
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update stock" });
    }
  });

  app.post('/verify-order', async (req, res) => {
    const { qrCodeData, vendingMachineId } = req.body;
    console.log(qrCodeData);
    

    try {
        
        const orderDetails = JSON.parse(qrCodeData);

        
        const existingOrder = await Order.findById(orderDetails.orderId);

        
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found or invalid.' });
        }
        
        
        
        
        if (String(existingOrder.vendingMachine) !== String(vendingMachineId)) {
            return res.status(400).json({ message: 'Vending machine does not match.' });
        }

        
        const isMatchingOrder = 
            String(existingOrder.user) === String(orderDetails.userId) &&
            String(existingOrder.vendingMachine) === String(orderDetails.vendingMachineId) &&
            existingOrder.total === orderDetails.total &&
            existingOrder.status === orderDetails.status;

        if (!isMatchingOrder) {
            return res.status(400).json({ message: 'Order details do not match.' });
        }

        
        if (existingOrder.items.length !== orderDetails.items.length) {
            return res.status(400).json({ message: 'Item count does not match.' });
        }

        for (let i = 0; i < existingOrder.items.length; i++) {
            const existingItem = existingOrder.items[i];
            const qrCodeItem = orderDetails.items.find(item => item.itemName === existingItem.itemName);

            if (!qrCodeItem) {
                return res.status(400).json({ message: `Item not found in the QR code: ${existingItem.itemName}` });
            }

            if (existingItem.quantity !== qrCodeItem.quantity || existingItem.price !== qrCodeItem.price) {
                return res.status(400).json({ message: `Item details do not match for ${existingItem.itemName}` });
            }
        }

        
        return res.status(200).json({ order: existingOrder });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/verify-order-machine', async (req, res) => {
  const { qrCodeData } = req.body;
  

  try {
      
      const orderDetails = JSON.parse(qrCodeData);

      
      const existingOrder = await Order.findById(orderDetails.orderId);

      
      if (!existingOrder) {
          return res.status(404).json({ message: 'Order not found or invalid.' });
      }
      
      
      
      
      const isMatchingOrder = 
          String(existingOrder.user) === String(orderDetails.userId) &&
          String(existingOrder.vendingMachine) === String(orderDetails.vendingMachineId) &&
          existingOrder.total === orderDetails.total &&
          existingOrder.status === orderDetails.status;

      if (!isMatchingOrder) {
          return res.status(400).json({ message: 'Order details do not match.' });
      }

      
      if (existingOrder.items.length !== orderDetails.items.length) {
          return res.status(400).json({ message: 'Item count does not match.' });
      }

      for (let i = 0; i < existingOrder.items.length; i++) {
          const existingItem = existingOrder.items[i];
          const qrCodeItem = orderDetails.items.find(item => item.itemName === existingItem.itemName);

          if (!qrCodeItem) {
              return res.status(400).json({ message: `Item not found in the QR code: ${existingItem.itemName}` });
          }

          if (existingItem.quantity !== qrCodeItem.quantity || existingItem.price !== qrCodeItem.price) {
              return res.status(400).json({ message: `Item details do not match for ${existingItem.itemName}` });
          }
      }

      
      return res.status(200).json({ order: existingOrder });

  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
  }
});
  
  
  app.post('/complete-order', async (req, res) => {
    const { orderId } = req.body;
  
    try {
      const existingOrder = await Order.findById(orderId);
  
      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found.' });
      }
  
      if (existingOrder.status !== 'Pending') {
        return res.status(400).json({ message: 'Order is already completed or not in pending status.' });
      }
  
      
      existingOrder.status = 'Completed';
      await existingOrder.save();
  
      return res.status(200).json({ message: 'Order completed successfully', order: existingOrder });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/undo-completed-order', async (req, res) => {
    const { orderId } = req.body;
  
    try {
      const existingOrder = await Order.findById(orderId);
  
      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found.' });
      }
  
      if (existingOrder.status !== 'Completed') {
        return res.status(400).json({ message: 'Order is not completed, cannot undo.' });
      }
  
      
      existingOrder.status = 'Pending';
      await existingOrder.save();
  
      return res.status(200).json({ message: 'Order status reverted to Pending', order: existingOrder });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  

app.listen(3000,function(req,res){
     console.log('Server is working');
});