import express from 'express';
import cors from 'cors';
import * as amqp from 'amqplib';

interface OrderStatus {
	orderId: number;
	status: string;
}

const app = express();
const PORT = 3000;
const completedOrders: OrderStatus[] = [];

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

app.use(cors());
app.use(express.json());

let channel: any = null;

// connect to RabbitMQ
async function connectRabbit() {
	try {
		const connection = await amqp.connect(RABBITMQ_URL);
		connection.on('error', (err: any) => {
			console.error('❌ RabbitMQ connection error:', err);
		});
		
		channel = await connection.createChannel();
		channel.on('error', (err: any) => {
			console.error('❌ RabbitMQ channel error:', err);
		});
		
		await channel.assertQueue('orders', { durable: false });
		console.log('✅ Connected to RabbitMQ');
	} catch (err) {
		console.error('❌ Failed to connect to RabbitMQ:', err);
	}
}

app.post('/api/order', async (req: any, res: any) => {
	try {
		const { name, quantity } = req.body;
		console.log('Received order:', req.body);

		if (!name || !quantity) {
			return res.status(400).json({ message: 'Missing name or quantity' });
		}

		if (!channel) {
			console.error('❌ RabbitMQ channel not ready');
			return res.status(500).json({ message: 'Server not connected to message queue' });
		}

		// Send message to RabbitMQ
		const order = JSON.stringify({ name, quantity });
		await channel.sendToQueue('orders', Buffer.from(order));
		console.log('✅ Sent to RabbitMQ:', order);

		res.status(200).json({ message: 'Order received' });

	} catch (err) {
		console.error('❌ Error in /api/order:', err);
		res.status(500).json({ message: 'Server error' });
	}
});


app.listen(PORT, () => {
	console.log(`🚀 Backend listening on http://localhost:${PORT}`);
	connectRabbit();
});

// Receive messages from RabbitMQ
async function receiveMessages() {
	try {
		const connection = await amqp.connect(RABBITMQ_URL);
		connection.on('error', (err: any) => {
			console.error('❌ RabbitMQ connection error in receiveMessages:', err);
		});
		
		const channel = await connection.createChannel();
		channel.on('error', (err: any) => {
			console.error('❌ RabbitMQ channel error in receiveMessages:', err);
		});

		await channel.assertQueue('orders', { durable: false });
		await channel.assertQueue('orderStatus', { durable: false });

		console.log('✅ Connected to RabbitMQ for receiving messages');

		channel.consume('orderStatus', (msg: any) => {
			if (msg !== null) {
				const orderStatus = JSON.parse(msg.content.toString());
				console.log('Received order status from orderStatus queue:', orderStatus);
				channel.ack(msg);
				completedOrders.push(orderStatus);
			}
		});

	} catch (err) {
		console.error('❌ Failed to connect to RabbitMQ for receiving messages:', err);
		process.exit(1);
	}
}

receiveMessages();

// Health check endpoint
app.get('/api/status', async (req: any, res: any) => {
	try {
		const status = {
			server: 'running',
			rabbitmq: channel ? 'connected' : 'disconnected',
			timestamp: new Date().toISOString()
		};
		res.status(200).json(status);
	} catch (err) {
		console.error('❌ Error in /api/status:', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Completed orders endpoint
app.get('/api/orders/completed', (req: any, res: any) => {
	res.json(completedOrders);
});